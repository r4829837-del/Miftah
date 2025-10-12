import argparse
import json
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd


SUBJECTS: List[str] = [
    "arabe",
    "amazigh",
    "francais",
    "anglais",
    "islamique",
    "civique",
    "histGeo",
    "math",
    "svt",
    "physique",
    "informatique",
    "arts",
    "musique",
    "sport",
    "moyenneSem1",
]


def _round_mean(value: float) -> float:
    return float(np.round(value, 2)) if np.isfinite(value) else np.nan


def _round_std(value: float) -> float:
    return float(np.round(value, 2)) if np.isfinite(value) else np.nan


def _round_pct(value: float) -> float:
    return float(np.round(value, 1)) if np.isfinite(value) else np.nan


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Keep only rows where moyenneSem1 is numeric (coerce errors to NaN then drop)."""
    df = df.copy()
    df["moyenneSem1"] = pd.to_numeric(df["moyenneSem1"], errors="coerce")
    df = df.loc[df["moyenneSem1"].notna()]
    # Ensure numeric columns for all subjects
    for col in SUBJECTS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
    return df


def _compute_bins(series: pd.Series) -> Tuple[Dict[str, Dict[str, float]], Dict[str, Dict[str, float]]]:
    s = series.dropna()
    n = len(s)

    def pct(count: int) -> float:
        return _round_pct((count / n) * 100) if n > 0 else 0.0

    # 7 tranches
    bins_defs = [
        ("0-8.99", (0.0, 8.99)),
        ("9-9.99", (9.0, 9.99)),
        ("10-11.99", (10.0, 11.99)),
        ("12-13.99", (12.0, 13.99)),
        ("14-15.99", (14.0, 15.99)),
        ("16-17.99", (16.0, 17.99)),
        ("18-20", (18.0, 20.0)),
    ]

    tranches: Dict[str, Dict[str, float]] = {}
    for name, (lo, hi) in bins_defs:
        cnt = int(((s >= lo) & (s <= hi)).sum())
        tranches[name] = {"count": cnt, "percent": pct(cnt)}

    # 5 qualitative groups
    groups_defs = [
        ("G1(0-8.99)", (0.0, 8.99)),
        ("G2(9-9.99)", (9.0, 9.99)),
        ("G3(10-11.99)", (10.0, 11.99)),
        ("G4(12-13.99)", (12.0, 13.99)),
        ("G5(≥14)", (14.0, 20.0)),
    ]

    groups: Dict[str, Dict[str, float]] = {}
    for name, (lo, hi) in groups_defs:
        cnt = int(((s >= lo) & (s <= hi)).sum())
        groups[name] = {"count": cnt, "percent": pct(cnt)}

    return tranches, groups


def _compute_subject_stats(series: pd.Series) -> Dict[str, object]:
    s = series.dropna()
    present = int(s.shape[0])
    mean = _round_mean(s.mean()) if present > 0 else np.nan
    # population std (ddof=0)
    std = _round_std(float(s.std(ddof=0))) if present > 0 else np.nan
    cv = _round_pct((std / mean) * 100) if present > 0 and mean not in (0, np.nan) else np.nan

    nb_ge10 = int((s >= 10).sum())
    nb_8_9 = int(((s >= 8) & (s < 10)).sum())
    nb_lt8 = int((s < 8).sum())

    pc_ge10 = _round_pct((nb_ge10 / present) * 100) if present > 0 else 0.0
    pc_8_9 = _round_pct((nb_8_9 / present) * 100) if present > 0 else 0.0
    pc_lt8 = _round_pct((nb_lt8 / present) * 100) if present > 0 else 0.0

    tranches, groups = _compute_bins(series)

    return {
        "present": present,
        "mean": mean,
        "std": std,
        "cv": cv,
        "nb_ge10": nb_ge10,
        "pc_ge10": pc_ge10,
        "nb_8_9": nb_8_9,
        "pc_8_9": pc_8_9,
        "nb_lt8": nb_lt8,
        "pc_lt8": pc_lt8,
        "tranches": tranches,
        "groupes": groups,
    }


def compute_for_group(df: pd.DataFrame, group_name: str) -> Dict[str, object]:
    result: Dict[str, object] = {"group": group_name, "subjects": {}}
    for subj in SUBJECTS:
        if subj in df.columns:
            result["subjects"][subj] = _compute_subject_stats(df[subj])
    return result


def _class_appreciation(mean_value: float) -> str:
    if pd.isna(mean_value):
        return ""
    if mean_value >= 16:
        return "Excellent"
    if mean_value >= 14:
        return "Très bien"
    if mean_value >= 12:
        return "Bien"
    if mean_value >= 10:
        return "Assez bien"
    return "Insuffisant"


def _compute_by_class(df: pd.DataFrame) -> Dict[str, object]:
    if "classe" not in df.columns:
        return {}
    grouped = df.groupby("classe", dropna=False)
    class_stats = {}
    # means
    means = grouped[SUBJECTS].mean(numeric_only=True)
    # ranking by moyenneSem1 desc (1 = best)
    ranking = means["moyenneSem1"].rank(ascending=False, method="min")
    # degree
    degree = 100 - (ranking - 1) * 10
    degree = degree.clip(lower=10, upper=100)

    for cls in means.index:
        row = means.loc[cls]
        class_stats[cls] = {
            "means": {k: _round_mean(v) for k, v in row.to_dict().items()},
            "rank": int(ranking.loc[cls]) if not pd.isna(ranking.loc[cls]) else None,
            "degree": int(degree.loc[cls]) if not pd.isna(degree.loc[cls]) else None,
            "appreciation": _class_appreciation(row.get("moyenneSem1", np.nan)),
        }
    return class_stats


def _counts_and_perc(count: int, total: int) -> Dict[str, float]:
    return {"count": int(count), "percent": _round_pct((count / total) * 100) if total > 0 else 0.0}


def _compute_global_students_stats(df: pd.DataFrame) -> Dict[str, object]:
    total = len(df)
    # Sexe
    sexe_str = df["sexe"].astype(str) if "sexe" in df.columns else pd.Series([], dtype=str)
    lower = sexe_str.str.lower()
    male = int((lower.isin(["m", "male", "garcon", "garçon"]) | sexe_str.isin(["ذكر"])) .sum()) if "sexe" in df.columns else 0
    female = int((lower.isin(["f", "female", "fille"]) | sexe_str.isin(["أنثى"])) .sum()) if "sexe" in df.columns else 0
    # Redouble
    redouble_str = df["redouble"].astype(str) if "redouble" in df.columns else pd.Series([], dtype=str)
    repeat = int((redouble_str.str.lower().isin(["1", "oui", "true", "vrai", "yes"])) | (redouble_str.isin(["نعم"])) .sum()) if "redouble" in df.columns else 0
    no_repeat = total - repeat
    # Branche
    st = int((df["branche"].astype(str).str.upper().str.contains("ST")) .sum()) if "branche" in df.columns else 0
    lettres = int((df["branche"].astype(str).str.lower().str.contains("lettres|lit|art")) .sum()) if "branche" in df.columns else 0

    result: Dict[str, object] = {
        "sex": {
            "male": _counts_and_perc(male, total),
            "female": _counts_and_perc(female, total),
            "total": _counts_and_perc(total, total),
        },
        "repeat": {
            "repeat": _counts_and_perc(repeat, total),
            "no_repeat": _counts_and_perc(no_repeat, total),
            "total": _counts_and_perc(total, total),
        },
        "branch": {
            "st": _counts_and_perc(st, total),
            "letters": _counts_and_perc(lettres, total),
            "total": _counts_and_perc(total, total),
        },
        "by_sex": {
            "male": {
                "repeat": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["m", "male", "garcon", "garçon"])) | (df["sexe"].astype(str).isin(["ذكر"])) ) &
                                                 (df["redouble"].astype(str).str.lower().isin(["1", "oui", "true", "vrai", "yes"]) | df["redouble"].astype(str).isin(["نعم"])) ).sum()), total),
                "no_repeat": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["m", "male", "garcon", "garçon"])) | (df["sexe"].astype(str).isin(["ذكر"])) ) &
                                                    (~(df["redouble"].astype(str).str.lower().isin(["1", "oui", "true", "vrai", "yes"]) | df["redouble"].astype(str).isin(["نعم"])) ) ).sum()), total),
                "st": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["m", "male", "garcon", "garçon"])) | (df["sexe"].astype(str).isin(["ذكر"])) ) &
                                             (df["branche"].astype(str).str.upper().str.contains("ST")) ).sum()), total),
                "letters": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["m", "male", "garcon", "garçon"])) | (df["sexe"].astype(str).isin(["ذكر"])) ) &
                                                  (df["branche"].astype(str).str.lower().str.contains("lettres|lit|art")) ).sum()), total),
            },
            "female": {
                "repeat": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["f", "female", "fille"])) | (df["sexe"].astype(str).isin(["أنثى"])) ) &
                                                 (df["redouble"].astype(str).str.lower().isin(["1", "oui", "true", "vrai", "yes"]) | df["redouble"].astype(str).isin(["نعم"])) ).sum()), total),
                "no_repeat": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["f", "female", "fille"])) | (df["sexe"].astype(str).isin(["أنثى"])) ) &
                                                    (~(df["redouble"].astype(str).str.lower().isin(["1", "oui", "true", "vrai", "yes"]) | df["redouble"].astype(str).isin(["نعم"])) ) ).sum()), total),
                "st": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["f", "female", "fille"])) | (df["sexe"].astype(str).isin(["أنثى"])) ) &
                                             (df["branche"].astype(str).str.upper().str.contains("ST")) ).sum()), total),
                "letters": _counts_and_perc(int((((df["sexe"].astype(str).str.lower().isin(["f", "female", "fille"])) | (df["sexe"].astype(str).isin(["أنثى"])) ) &
                                                  (df["branche"].astype(str).str.lower().str.contains("lettres|lit|art")) ).sum()), total),
            },
        },
    }
    return result


def _mentions(df: pd.DataFrame) -> Dict[str, Dict[str, float]]:
    s = df["moyenneSem1"].dropna()
    n = len(s)
    def pct(c: int) -> float:
        return _round_pct((c / n) * 100) if n > 0 else 0.0
    cats = {
        "excellence": ((s >= 18) & (s <= 20)).sum(),
        "felicitations": ((s >= 15) & (s <= 17.99)).sum(),
        "encouragements": ((s >= 14) & (s <= 14.99)).sum(),
        "tableau_honneur": ((s >= 12) & (s <= 13.99)).sum(),
        "observation": (s < 12).sum(),
    }
    return {k: {"count": int(v), "percent": pct(int(v))} for k, v in cats.items()}


def build_final_json(df: pd.DataFrame) -> Dict[str, object]:
    stats: Dict[str, object] = {}

    # Global stats for all students
    stats["overall"] = compute_for_group(df, "overall")

    # Sub-populations
    if "sexe" in df.columns:
        male_df = df[df["sexe"].astype(str).str.lower().isin(["m", "male", "garcon", "garçon"])]
        female_df = df[df["sexe"].astype(str).str.lower().isin(["f", "female", "fille"])]
        stats["male"] = compute_for_group(male_df, "male")
        stats["female"] = compute_for_group(female_df, "female")
    else:
        stats["male"] = {"group": "male", "subjects": {}}
        stats["female"] = {"group": "female", "subjects": {}}

    if "redouble" in df.columns:
        repeat_df = df[df["redouble"].astype(str).str.lower().isin(["1", "oui", "true", "vrai", "yes"]) ]
        no_repeat_df = df[~df.index.isin(repeat_df.index)]
        stats["repeat"] = compute_for_group(repeat_df, "repeat")
        stats["no_repeat"] = compute_for_group(no_repeat_df, "no_repeat")
    else:
        stats["repeat"] = {"group": "repeat", "subjects": {}}
        stats["no_repeat"] = {"group": "no_repeat", "subjects": {}}

    # By class
    stats["by_class"] = _compute_by_class(df)

    # Global students aggregates
    stats["students"] = _compute_global_students_stats(df)

    # Mentions on moyenneSem1
    stats["mentions"] = _mentions(df)

    return stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Compute education statistics JSON from Excel.")
    parser.add_argument("excel_path", help="Path to the Excel file containing the PremièreTrimestre sheet")
    parser.add_argument("--sheet", default="PremièreTrimestre", help="Sheet name (default: PremièreTrimestre)")
    args = parser.parse_args()

    # Read excel
    df = pd.read_excel(args.excel_path, sheet_name=args.sheet, dtype=str)

    # Optional: auto-map Arabic headers to expected schema if detected
    arabic_to_expected = {
        "الرقم": "numero",
        "اللقب و الاسم": "nomPrenom",
        "تاريخ الميلاد": "dateNaissance",
        "الجنس": "sexe",
        "الإعادة": "redouble",
        "اللغة العربية": "arabe",
        "اللغة اﻷمازيغية": "amazigh",
        "اللغة الفرنسية": "francais",
        "اللغة الإنجليزية": "anglais",
        "التربية الإسلامية": "islamique",
        "التربية المدنية": "civique",
        "التاريخ والجغرافيا": "histGeo",
        "الرياضيات": "math",
        "ع الطبيعة و الحياة": "svt",
        "ع الفيزيائية والتكنولوجيا": "physique",
        "المعلوماتية": "informatique",
        "التربية التشكيلية": "arts",
        "التربية الموسيقية": "musique",
        "ت البدنية و الرياضية": "sport",
        "معدل الفصل": "moyenneSem1",
        # Optional fallbacks for missing fields
        "الشعبة": "branche",
        "القسم": "classe",
        "المستوى": "niveau",
    }
    intersect = {k: v for k, v in arabic_to_expected.items() if k in df.columns}
    if intersect:
        df = df.rename(columns=intersect)
    # Keep only required columns if they exist
    expected_cols = [
        "numero","nomPrenom","dateNaissance","sexe","redouble",
        "arabe","amazigh","francais","anglais","islamique","civique","histGeo",
        "math","svt","physique","informatique","arts","musique","sport",
        "moyenneSem1","branche","classe","niveau",
    ]
    # Ensure all expected columns exist
    for c in expected_cols:
        if c not in df.columns:
            df[c] = np.nan

    df = df[expected_cols]
    df = clean_data(df)

    stats = build_final_json(df)
    print(json.dumps({"stats": stats}, ensure_ascii=False))


if __name__ == "__main__":
    main()


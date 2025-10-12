// Liste des utilisateurs autorisés pour l'application Appamine
export const AUTHORIZED_USERS = [
  { id: 'ouanas200', email: 'ouanas200@gmail.com', password: '8sh6jnad', role: 'admin' },
  { id: 'lyce-kablia', email: 'lyce.kablia@gmail.com', password: '7e4fg8h7', role: 'admin' },
  { id: 'bvbsowmosta', email: 'bvbsowmosta@gmail.com', password: '00000', role: 'admin' },
  { id: 'admin', email: 'admin@gmail.com', password: 'admin', role: 'admin' },
  { id: 'houari-gbl1051', email: 'houarigbl1051@gmail.com', password: 'qtxi2syk', role: 'admin' }
];

export interface AuthorizedUser {
  id: string;
  email: string;
  password: string;
  role: string;
}
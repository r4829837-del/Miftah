import React from 'react';

interface SocialTestResultsProps {
  score?: number;
  analysis?: string;
  strengths?: string[];
  recommendations?: string[];
}

const SocialTestResults: React.FC<SocialTestResultsProps> = ({
  score = 0,
  analysis = "",
  strengths = [],
  recommendations = []
}) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-600">Résultats du Test Social</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold">Score: {score}/100</span>
          <div className="w-32 bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Analyse</h3>
          <p className="text-gray-700">{analysis}</p>
        </div>
      )}

      {strengths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Points forts</h3>
          <ul className="list-disc list-inside space-y-1">
            {strengths.map((strength, index) => (
              <li key={index} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Recommandations</h3>
          <ul className="list-disc list-inside space-y-1">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SocialTestResults;
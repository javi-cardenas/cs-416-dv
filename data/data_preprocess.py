import pandas as pd

df = pd.read_csv("./original-dataset/stack-overflow-developer-survey-2024/survey_results_public.csv")
columns_for_viz = ["Age", "YearsCodePro", "Country", "Currency", "CompTotal", "ConvertedCompYearly", "LanguageHaveWorkedWith", "NEWCollabToolsHaveWorkedWith", "OpSysProfessional use", "AISelect"]
df = df[columns_for_viz]
df_clean = df.dropna(subset=["Age", "YearsCodePro", "Country", "Currency", "CompTotal", "LanguageHaveWorkedWith", "NEWCollabToolsHaveWorkedWith", "OpSysProfessional use", "AISelect"])
df_clean.to_json('./project-dataset/data.json', orient='records', indent=2)

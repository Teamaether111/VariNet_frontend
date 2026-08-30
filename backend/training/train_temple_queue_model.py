"""
Train VARI-Net's Temple Queue Wait-Time Prediction model.

Input:
    data/wari_temple_queue_dataset_8Jul_29Jul_2026.csv

Output:
    models/temple_queue_model.pkl

Target:
    queue_minutes
"""

from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "wari_temple_queue_dataset_8Jul_29Jul_2026.csv"
)

MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "temple_queue_model.pkl"

TARGET_COLUMN = "queue_minutes"

NUMERIC_FEATURES = [
    "hour",
    "day_of_week",
    "waiting_people",
    "gates_open",
    "crowd_count",
    "crowd_density",
]

CATEGORICAL_FEATURES = [
    "zone_id",
    "location",
    "route_type",
    "darshan_status",
    "is_peak_day",
]


def load_and_prepare_data() -> pd.DataFrame:
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found at:\n{DATA_PATH}\n\n"
            "Move your CSV file into backend/data/ and rename it to:\n"
            "wari_temple_queue_dataset_8Jul_29Jul_2026.csv"
        )

    data = pd.read_csv(DATA_PATH)

    required_columns = (
    [
        column
        for column in NUMERIC_FEATURES
        if column != "day_of_week"
    ]
    + CATEGORICAL_FEATURES
    + ["date", TARGET_COLUMN]
)

    missing_columns = [
        column
        for column in required_columns
        if column not in data.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # Your CSV dates are in DD/MM/YYYY format, e.g. 08/07/2026
    data["date"] = pd.to_datetime(
        data["date"],
        format="%d/%m/%Y",
        errors="coerce",
    )

    if data["date"].isna().any():
        raise ValueError(
            "Some date values could not be read. "
            "Expected format: DD/MM/YYYY"
        )

    # Derive weekday as an additional useful feature.
    # Monday = 0, Sunday = 6
    data["day_of_week"] = data["date"].dt.dayofweek

    data = data.dropna(
        subset=NUMERIC_FEATURES
        + CATEGORICAL_FEATURES
        + [TARGET_COLUMN]
    )

    return data


def main():
    data = load_and_prepare_data()

    feature_columns = (
        NUMERIC_FEATURES + CATEGORICAL_FEATURES
    )

    X = data[feature_columns]
    y = data[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
    )

    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
        ]
    )

    categorical_pipeline = Pipeline(
        steps=[
            (
                "imputer",
                SimpleImputer(strategy="most_frequent"),
            ),
            (
                "encoder",
                OneHotEncoder(
                    handle_unknown="ignore",
                ),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numeric",
                numeric_pipeline,
                NUMERIC_FEATURES,
            ),
            (
                "categorical",
                categorical_pipeline,
                CATEGORICAL_FEATURES,
            ),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=300,
        random_state=42,
        n_jobs=-1,
        min_samples_leaf=2,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    print("Training temple queue prediction model...")
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    rmse = mean_squared_error(
        y_test,
        predictions,
    ) ** 0.5
    r2 = r2_score(y_test, predictions)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    joblib.dump(
        {
            "pipeline": pipeline,
            "feature_columns": feature_columns,
            "target_column": TARGET_COLUMN,
            "numeric_features": NUMERIC_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
        },
        MODEL_PATH,
    )

    print("\nTemple queue model trained successfully.")
    print(f"Dataset rows used: {len(data)}")
    print(f"Model saved at: {MODEL_PATH}")
    print(f"Mean Absolute Error: {mae:.2f} minutes")
    print(f"Root Mean Squared Error: {rmse:.2f} minutes")
    print(f"R² Score: {r2:.4f}")


if __name__ == "__main__":
    main()
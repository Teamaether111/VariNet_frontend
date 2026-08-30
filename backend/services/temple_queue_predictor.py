from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "temple_queue_model.pkl"


@lru_cache
def load_temple_queue_model() -> dict[str, Any]:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            "Temple queue model not found. Run "
            "training/train_temple_queue_model.py first."
        )

    model_bundle = joblib.load(MODEL_PATH)
    if not isinstance(model_bundle, dict):
        raise RuntimeError("Temple queue model file has an invalid format.")
    if "pipeline" not in model_bundle or "feature_columns" not in model_bundle:
        raise RuntimeError(
            "Temple queue model bundle is missing pipeline or feature_columns."
        )
    return model_bundle


def predict_queue_wait(features: dict[str, Any]) -> float:
    model_bundle = load_temple_queue_model()
    pipeline = model_bundle["pipeline"]
    feature_columns = model_bundle["feature_columns"]

    missing_features = [
        column for column in feature_columns if column not in features
    ]
    if missing_features:
        raise ValueError(f"Missing model features: {missing_features}")

    input_data = pd.DataFrame(
        [{column: features[column] for column in feature_columns}]
    )
    prediction = float(pipeline.predict(input_data)[0])
    return round(max(0.0, prediction), 2)

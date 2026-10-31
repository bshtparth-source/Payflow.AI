import json
from pathlib import Path
from typing import Dict, Any

_CACHED_DATA: Dict[str, Any] = {}


def get_mock_data() -> Dict[str, Any]:
    global _CACHED_DATA
    if not _CACHED_DATA:
        seed_path = Path(__file__).parent / "seed.json"
        if seed_path.exists():
            with open(seed_path, "r", encoding="utf-8") as f:
                _CACHED_DATA = json.load(f)
        else:
            _CACHED_DATA = {"business": {}, "buyers": [], "invoices": [], "disputes": [], "reminders": []}
    return _CACHED_DATA

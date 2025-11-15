import json  # noqa: CPY001, D100
import pathlib
from functools import lru_cache

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


@lru_cache(maxsize=1024)  # pyright: ignore[reportUntypedFunctionDecorator]
def get_award_data(player_nba_id: int) -> dict[str, int]:
    """
    Fetches award data for a given NBA player using their NBA ID.

    Args:
        player_nba_id (int): The NBA ID of the player.

    Returns:
        dict: A dictionary containing the player's award data.
    """
    base_url = "https://www.nba.com/player/{}"

    data = requests.get(base_url.format(player_nba_id), timeout=60)
    data.raise_for_status()

    soup = BeautifulSoup(data.text, "lxml")

    div = soup.select_one('div[class*="PlayerProfile_ppAwards"]')

    if not div:
        return {}

    ul = div.find("ul")  # pyright: ignore[reportOptionalMemberAccess]

    raw_data = [" ".join(li.stripped_strings) for li in ul.find_all("li", recursive=False)]  # pyright: ignore[reportOptionalMemberAccess]

    output = {}

    for entry in raw_data:
        parts = entry.split(" ")

        award_amount = int(parts[0])
        award_name = " ".join(parts[1:])

        output[award_name] = award_amount

    return output  # pyright: ignore[reportUnknownVariableType]


def main() -> None:
    """Main function to enrich player data with award information."""
    with pathlib.Path("data/teams.json").open("r", encoding="utf-8") as f:
        teams = json.load(f)

    for team in tqdm(teams):
        curr_df = pd.read_csv(
            f"frontend/public/data/csv/{team}_enriched.csv",  # pyright: ignore[reportUnknownMemberType]
        )

        # Normalize types
        nba_id_series = pd.to_numeric(curr_df["nba_id"], errors="coerce").astype("Int64")
        yos_series = pd.to_numeric(curr_df["YOS"], errors="coerce").fillna(0).astype("Int64")

        # Only fetch awards for valid nba_id and YOS > 0
        valid_mask = nba_id_series.notna() & (yos_series != 0)
        valid_ids = nba_id_series[valid_mask].dropna().unique()

        award_map: dict[int, dict[str, int]] = {}

        # Fetch award data once per unique NBA ID
        for nba_id in tqdm(valid_ids, leave=False):
            award_data = get_award_data(int(nba_id))

            # Log info, but only store entries that actually have award data
            if not award_data:
                continue

            award_map[int(nba_id)] = award_data

        # Mask out rows that shouldn't have awards (invalid id or YOS == 0)
        nba_id_for_map = nba_id_series.where(valid_mask)

        # Map NBA ID -> award dict; rows with no data remain NaN instead of explicit None
        curr_df["awards"] = nba_id_for_map.map(award_map)

        # Save / inspect
        curr_df.to_csv(f"frontend/public/data/csv/{team}_enriched.csv", index=False)
        print(f"Fetched awards for team: {team}")


if __name__ == "__main__":
    main()

"""Run two fixed defense reviews using Jason-XII's external simulator."""
import argparse
import json
import os
from pathlib import Path
import sys


def replay(use_cannon):
    from battle import BattleState
    from core import Position
    from player import PlayerState

    deck = ["Cannon", "HogRider", "Knight", "Skeletons", "Fireball", "Arrows", "Giant", "Musketeer"]
    battle = BattleState(PlayerState(0, deck, 10), PlayerState(1, deck, 10))
    towers = {"left": 3, "right": 4, "king": 6}

    def tower_hp():
        return {name: max(0, battle.entities[i].hp) for name, i in towers.items()}

    before = tower_hp()
    actions = [(0, 1, "HogRider", 3.5, 18.5)]
    if use_cannon:
        actions.append((10, 0, "Cannon", 6.5, 11.5))
    spent = 0
    for tick in range(400):
        for when, player, card, x, y in actions:
            if tick != when:
                continue
            balance = battle.players[player].elixir
            if not battle.deploy_card(player, card, Position(x, y)):
                raise ValueError(f"Deployment rejected at tick {tick}: {card}")
            if player == 0:
                spent += balance - battle.players[player].elixir
        battle.step(0.05)
    after = tower_hp()
    damage = {name: before[name] - after[name] for name in towers}
    return {"defense": "Cannon" if use_cannon else "Hold", "seconds": 20,
            "elixirSpent": spent, "towerDamage": damage, "totalTowerDamage": sum(damage.values())}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("simulator_dir", type=Path, help="Upstream src/clasher_new directory")
    source = parser.parse_args().simulator_dir.resolve()
    sys.path.insert(0, str(source))
    os.chdir(source)  # Upstream loads card data relative to its working directory.
    print(json.dumps([replay(False), replay(True)], indent=2))

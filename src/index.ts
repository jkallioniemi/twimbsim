interface CombatStatsMap {
  quantity: number
  attacks: number
  attackRating: number
  attacksPerQuantity: number
}

interface Ship {
  attacks: number
  combatRating: number
  hasSustainDamage: boolean
  hadSustainDamage: boolean
  destroyed: boolean
}

const createShips = (
  quantity: number,
  attacks: number,
  combatRating: number,
  hasSustainDamage = false
): Ship[] => {
  const ships: Ship[] = []
  for (let index = 0; index < quantity; index++) {
    ships.push({
      attacks,
      combatRating,
      hasSustainDamage,
      hadSustainDamage: false,
      destroyed: false,
    })
  }
  return ships
}

const attackerCombatants: readonly Ship[] = Object.freeze([
  ...createShips(2, 3, 4, true),
  ...createShips(4, 1, 6, true),
  ...createShips(20, 1, 9),
  ...createShips(2, 1, 9),
])

const defenderCombatants: readonly Ship[] = Object.freeze([
  ...createShips(24, 1, 8),
  ...createShips(4, 1, 9),
])

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

const rollD10 = () => getRandomInt(1, 11)

const rollHits = (ships: Ship[]): number =>
  ships.reduce((acc, { attacks, combatRating, destroyed }) => {
    if (destroyed) {
      return acc
    }

    let currentHits = 0
    for (let i = 0; i < attacks; i++) {
      if (rollD10() >= combatRating) {
        currentHits = currentHits + 1
      }
    }
    return acc + currentHits
  }, 0)

const assignHits = (hits: number, combatantShips: Ship[]): number => {
  let numDestroyed = 0
  // First pass: use sustain damage on all ships that can do so
  for (const ship of combatantShips) {
    if (hits === 0) {
      break
    }

    if (ship.hasSustainDamage) {
      ship.hasSustainDamage = false
      ship.hadSustainDamage = true
      hits = hits - 1
    }
  }

  // Second pass: destroy ships that did not use sustain damage
  for (let i = combatantShips.length - 1; i >= 0; i--) {
    if (hits === 0) {
      break
    }

    const ship = combatantShips[i]
    if (ship.hadSustainDamage) {
      ship.hadSustainDamage = false
      continue
    }

    ship.destroyed = true
    numDestroyed = numDestroyed + 1
    hits = hits - 1
  }

  // Third pass: destroy ships that used sustain damage
  for (let i = combatantShips.length - 1; i >= 0; i--) {
    if (hits === 0) {
      break
    }

    const ship = combatantShips[i]
    ship.destroyed = true
    numDestroyed = numDestroyed + 1
    hits = hits - 1
  }

  return numDestroyed
}

const resolveCombat = (attacker: Ship[], defender: Ship[]) => {
  let attackerHits = 0
  let defenderHits = 0
  let rounds = 0

  let attackerShips = attacker.length
  let defenderShips = defender.length

  while (attackerShips > 0 && defenderShips > 0) {
    rounds = rounds + 1
    const newAttackerHits = rollHits(attacker)
    attackerHits = attackerHits + newAttackerHits
    const newDefenderHits = rollHits(defender)
    defenderHits = defenderHits + newDefenderHits

    const attackerShipsLost = assignHits(newDefenderHits, attacker)
    attackerShips = Math.max(attackerShips - attackerShipsLost, 0)
    const defenderShipsLost = assignHits(newAttackerHits, defender)
    defenderShips = Math.max(defenderShips - defenderShipsLost, 0)
  }

  const winner =
    attackerShips === defenderShips
      ? 'draw'
      : attackerShips > defenderShips
      ? 'attacker'
      : 'defender'
  return winner
}

const createCopyShips = (ships: readonly Ship[]): Ship[] => {
  return Object.assign(
    [],
    ships.map((item: Readonly<Ship>) => Object.assign({}, item))
  )
}

const winnerMap = { attacker: 0, defender: 0, draw: 0 }
const totalFights = 100000

for (let index = 0; index < totalFights; index++) {
  const winner = resolveCombat(
    createCopyShips(attackerCombatants),
    createCopyShips(defenderCombatants)
  )
  winnerMap[winner] += 1
}

const rTP = (x: number, precision: number) => {
  const y = +x + (precision === undefined ? 0.5 : precision / 2)
  return y - (y % (precision === undefined ? 1 : +precision))
}

const attWinPercentage = rTP(100 * (winnerMap.attacker / totalFights), 2)
const drawPercentage = rTP(100 * (winnerMap.draw / totalFights), 2)
const defWinPercentage = rTP(100 * (winnerMap.defender / totalFights), 2)

console.log(`attacker wins: ${winnerMap.attacker} (${attWinPercentage}%)`)
console.log(`draws: ${winnerMap.draw} (${drawPercentage}%)`)
console.log(`defender wins: ${winnerMap.defender} (${defWinPercentage}%)`)

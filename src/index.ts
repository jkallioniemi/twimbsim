interface CombatStatsMap {
  quantity: number
  attacks: number
  attackRating: number
  attacksPerQuantity: number
}

const createCombatStatsMap = (
  quantity: number,
  attacks: number,
  attackRating: number,
  attacksPerQuantity = 1
): CombatStatsMap =>
  Object.freeze({
    quantity,
    attacks,
    attackRating,
    attacksPerQuantity,
  })

const attackerCombatants: readonly CombatStatsMap[] = Object.freeze([
  createCombatStatsMap(2, 6, 4, 3),
  createCombatStatsMap(1, 1, 6),
  createCombatStatsMap(17, 17, 9),
  createCombatStatsMap(2, 2, 10),
])

const defenderCombatants: readonly CombatStatsMap[] = Object.freeze([
  createCombatStatsMap(24, 24, 8),
  createCombatStatsMap(4, 4, 9),
])

// const attackerCombatants: readonly CombatStatsMap[] = Object.freeze([
//   createCombatStatsMap(1, 2, 7, 2),
//   createCombatStatsMap(1, 1, 6),
//   createCombatStatsMap(6, 6, 9),
//   createCombatStatsMap(2, 2, 10),
// ])

// const defenderCombatants: readonly CombatStatsMap[] = Object.freeze([
//   createCombatStatsMap(3, 3, 8),
//   createCombatStatsMap(4, 4, 9),
// ])

const getRandomInt = (min: number, max: number) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

const rollDie = () => getRandomInt(1, 11)

const rollHits = (combatStatsMaps: CombatStatsMap[]): number => {
  return combatStatsMaps.reduce((acc, { attacks, attackRating }) => {
    let currentHits = 0
    for (let i = 0; i < attacks; i++) {
      if (rollDie() >= attackRating) {
        currentHits = currentHits + 1
      }
    }
    return acc + currentHits
  }, 0)
}

const assignHits = (hits: number, combatant: CombatStatsMap[]) => {
  while (hits > 0) {
    const highestAR = combatant.reduce((acc, { attackRating }) => {
      if (attackRating > acc) {
        return attackRating
      }
      return acc
    }, 0)
    if (highestAR === 0) {
      return null
    }
    const assigneeIndex = combatant.findIndex(
      ({ attackRating }) => attackRating === highestAR
    )
    const { quantity } = combatant[assigneeIndex]
    if (hits >= quantity) {
      combatant.splice(assigneeIndex, 1)
      hits = hits - Math.abs(quantity - hits)
    } else {
      combatant[assigneeIndex].quantity =
        combatant[assigneeIndex].quantity - hits
      combatant[assigneeIndex].attacks =
        combatant[assigneeIndex].attacksPerQuantity *
        combatant[assigneeIndex].quantity
      hits = hits - quantity
    }
  }
}

const resolveCombat = (
  attacker: CombatStatsMap[],
  defender: CombatStatsMap[]
) => {
  // const attackerTotalHP = attacker.reduce(
  //   (acc, { quantity }) => acc + quantity,
  //   0
  // )

  // const defenderTotalHP = defender.reduce(
  //   (acc, { quantity }) => acc + quantity,
  //   0
  // )

  let attackerHits = 0
  let defenderHits = 0
  let rounds = 0

  while (!(attacker.length === 0 || defender.length === 0)) {
    rounds = rounds + 1
    const newAttackerHits = rollHits(attacker)
    attackerHits = attackerHits + newAttackerHits
    const newDefenderHits = rollHits(defender)
    defenderHits = defenderHits + newDefenderHits

    assignHits(newDefenderHits, attacker)
    assignHits(newAttackerHits, defender)
  }

  // console.log('rounds', rounds)
  // console.log(`winner: ${attacker.length > 0 ? 'attacker' : 'defender'}`)
  // console.log(`attacker hits: ${attackerHits} (needed ${defenderTotalHP})`)
  // console.log(`defender hits: ${defenderHits} (needed ${attackerTotalHP})`)
  const winner = attacker.length > 0 ? 'attacker' : 'defender'
  return winner
}

const createCopyCombatants = (
  combatants: readonly CombatStatsMap[]
): CombatStatsMap[] => {
  return Object.assign(
    [],
    combatants.map((item: Readonly<CombatStatsMap>) => Object.assign({}, item))
  )
}

const winnerMap = { attacker: 0, defender: 0 }
const totalFights = 100000

for (let index = 0; index < totalFights; index++) {
  const winner = resolveCombat(
    createCopyCombatants(attackerCombatants),
    createCopyCombatants(defenderCombatants)
  )
  winnerMap[winner] += 1
}

const rTP = (x: number, precision: number) => {
  const y = +x + (precision === undefined ? 0.5 : precision / 2)
  return y - (y % (precision === undefined ? 1 : +precision))
}

const attWinPercentage = rTP(100 * (winnerMap.attacker / totalFights), 2)

console.log(`attacker wins: ${winnerMap.attacker} (${attWinPercentage}%)`)
console.log(`defender wins: ${winnerMap.defender} (${100 - attWinPercentage}%)`)

const client = io()
const context = canvas.getContext('2d')
const backgroudColor = '#231f20'
const playerColor = '#ccc'
const enemyColor = '#666'
const player1Color = '#c33'
const player2Color = '#33c'
const appleColor = '#e66916'
let canvasSize,
    playerNumber = 0

client.on('playerNumber', (number) => {
    playerNumber = number
    if (playerNumber == 0) document.getElementById('controller').classList.add('hidden')
    else document.getElementById('controller').classList.remove('hidden')
    document.getElementById('player1score').classList.value = ['player1', 'player', 'enemy'][playerNumber]
    document.getElementById('player2score').classList.value = ['player2', 'enemy', 'player'][playerNumber]
})

function draw(apple, player1, player2) {
    const cellSize = canvasSize / 20

    context.fillStyle = backgroudColor
    context.fillRect(0, 0, canvasSize, canvasSize)

    context.fillStyle = [player1Color, playerColor, enemyColor][playerNumber]
    player1.snake.map((cell) => context.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize))

    context.fillStyle = [player2Color, enemyColor, playerColor][playerNumber]
    player2.snake.map((cell) => context.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize))

    context.fillStyle = appleColor
    context.fillRect(cellSize * apple.x, cellSize * apple.y, cellSize, cellSize)

    document.getElementById('player1score').innerText = player1.snake.length
    document.getElementById('player2score').innerText = player2.snake.length
}
client.on('game', ({ apple, player1, player2 }) => draw(apple, player1, player2))

const resize = () => (canvasSize = canvas.height = canvas.width)
resize()
window.addEventListener('resize', resize)
window.addEventListener('keydown', (e) => client.emit('keydown', e.key))

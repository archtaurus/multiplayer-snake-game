const client = io()
const context = canvas.getContext('2d')
const backgroudColor = '#231f20'
const playerColor = '#ccc'
const enemyColor = '#666'
const player1Color = '#c33'
const player2Color = '#33c'
const appleColor = '#e66916'
let canvasSize

function drawGame(game) {
    const cellSize = canvasSize / game.grids
    context.fillStyle = backgroudColor
    context.fillRect(0, 0, canvasSize, canvasSize)

    const isPlayer = client.id == game.players[0].id || client.id == game.players[1].id

    context.fillStyle = isPlayer ? (game.players[0].id == client.id ? playerColor : enemyColor) : player1Color
    game.players[0].snake.map((cell) => context.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize))

    context.fillStyle = isPlayer ? (game.players[1].id == client.id ? playerColor : enemyColor) : player2Color
    game.players[1].snake.map((cell) => context.fillRect(cellSize * cell.x, cellSize * cell.y, cellSize, cellSize))

    context.fillStyle = appleColor
    context.fillRect(cellSize * game.apple.x, cellSize * game.apple.y, cellSize, cellSize)

    // if (!isPlayer) {
    //     document.getElementById('player1score').innerText = game.players[0].snake.length
    //     document.getElementById('player2score').innerText = game.players[1].snake.length
    // }

    if (isPlayer) {
        document.getElementById('player1score').classList.value = 'player'
        document.getElementById('player2score').classList.value = 'enemy'

        if (game.players[0].id == client.id) {
            document.getElementById('player1score').innerText = game.players[0].snake.length
            document.getElementById('player2score').innerText = game.players[1].snake.length
        } else {
            document.getElementById('player1score').innerText = game.players[1].snake.length
            document.getElementById('player2score').innerText = game.players[0].snake.length
        }
    } else {
        document.getElementById('player1score').classList.value = 'player1'
        document.getElementById('player1score').innerText = game.players[0].snake.length

        document.getElementById('player2score').classList.value = 'player2'
        document.getElementById('player2score').innerText = game.players[1].snake.length
    }
    // if (game.players[0].id == client.id) {
    // } else {
    //     document.getElementById('player1score').innerText = game.players[1].snake.length
    //     document.getElementById('player2score').innerText = game.players[0].snake.length
    // }

    if (!isPlayer) document.getElementById('controller').classList.add('hidden')
}

const resize = () => {
    canvasSize = canvas.height = canvas.width
}

window.addEventListener('resize', resize)
window.addEventListener('keydown', (e) => client.emit('keydown', e.key))

client.on('game', (game) => drawGame(game))

resize()

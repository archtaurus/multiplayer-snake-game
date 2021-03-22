const express = require('express')
const app = express()
app.use(express.static('public'))
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8000
const server = app.listen(port, host, () => console.log(`server started at http://${host}:${port}/`))
const io = require('socket.io')(server)

const gridSize = 20

const apple = { x: 10, y: 10 }

const player1 = {
    id: '',
    key: '',
    pos: { x: 3, y: 1 },
    vel: { x: 1, y: 0 },
    snake: [
        { x: 3, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 1 },
    ],
}

const player2 = {
    id: '',
    key: '',
    pos: { x: 16, y: 18 },
    vel: { x: -1, y: 0 },
    snake: [
        { x: 16, y: 18 },
        { x: 17, y: 18 },
        { x: 18, y: 18 },
    ],
}

io.on('connection', (client) => {
    // first two clients are players
    if (!player1.id) {
        client.emit('playerNumber', 1)
        player1.id = client.id
    } else if (!player2.id) {
        client.emit('playerNumber', 2)
        player2.id = client.id
    } else {
        client.emit('playerNumber', 0)
        return
    }

    // restart game when new player joins
    player1.snake = player1.snake.slice(0, 3)
    player2.snake = player2.snake.slice(0, 3)

    client.on('keydown', (key) => {
        if (client.id == player1.id) player1.key = key
        else player2.key = key
    })

    client.on('disconnect', () => {
        if (client.id == player1.id) player1.id = ''
        else player2.id = ''
    })
})

setInterval(() => {
    for (let player of [player1, player2]) {
        // snake turn
        if (player.key == 'ArrowDown' && player.vel.y == 0) player.vel = { x: 0, y: 1 }
        else if (player.key == 'ArrowUp' && player.vel.y == 0) player.vel = { x: 0, y: -1 }
        else if (player.key == 'ArrowLeft' && player.vel.x == 0) player.vel = { x: -1, y: 0 }
        else if (player.key == 'ArrowRight' && player.vel.x == 0) player.vel = { x: 1, y: 0 }
        player.key = ''
        // snake move
        player.pos.x = (player.pos.x + player.vel.x + gridSize) % gridSize
        player.pos.y = (player.pos.y + player.vel.y + gridSize) % gridSize
        player.snake.unshift({ x: player.pos.x, y: player.pos.y })
        // snake eat
        if (player.pos.x == apple.x && player.pos.y == apple.y) {
            // reset apple
            apple.x = Math.floor(Math.random() * gridSize)
            apple.y = Math.floor(Math.random() * gridSize)
        } else player.snake.pop()
        // snake collide
        if (
            player1.snake.slice(1).some((c) => player.pos.x == c.x && player.pos.y == c.y) ||
            player2.snake.slice(1).some((c) => player.pos.x == c.x && player.pos.y == c.y)
        )
            player.snake.length > 3 && player.snake.pop()
    }
    // brocast game state
    io.emit('game', { apple, player1, player2 })
}, 200)

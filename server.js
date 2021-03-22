const express = require('express')
const app = express()
app.use(express.static('public'))
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 8000
const server = app.listen(port, host, () => console.log(`server started at http://${host}:${port}/`))
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        optionsSuccessStatus: 204,
    },
})
const game = {
    grids: 20,
    apple: { x: 10, y: 10 },
    players: [
        {
            id: '',
            key: '',
            pos: { x: 3, y: 1 },
            vel: { x: 1, y: 0 },
            snake: [
                { x: 3, y: 1 },
                { x: 2, y: 1 },
                { x: 1, y: 1 },
            ],
        },
        {
            id: '',
            key: '',
            pos: { x: 16, y: 18 },
            vel: { x: -1, y: 0 },
            snake: [
                { x: 16, y: 18 },
                { x: 17, y: 18 },
                { x: 18, y: 18 },
            ],
        },
    ],
}

const player1 = game.players[0]
const player2 = game.players[1]

io.on('connection', (client) => {
    // 有空位即注册为玩家，否则是观众
    if (!player1.id) player1.id = client.id
    else if (!player2.id) player2.id = client.id
    else return
    client.on('keydown', (key) => {
        if (player1.id == client.id) player1.key = key
        else player2.key = key
    })
    client.on('disconnect', () => {
        if (player1.id == client.id) player1.id = ''
        else player2.id = ''
    })
})

function randomInRange(start, end) {
    return Math.floor(Math.random() * (end - start + 1) + start)
}

setInterval(() => {
    let reset = false

    if (player1.key == 'ArrowDown' && player1.vel.y == 0) player1.vel = { x: 0, y: 1 }
    else if (player1.key == 'ArrowUp' && player1.vel.y == 0) player1.vel = { x: 0, y: -1 }
    else if (player1.key == 'ArrowLeft' && player1.vel.x == 0) player1.vel = { x: -1, y: 0 }
    else if (player1.key == 'ArrowRight' && player1.vel.x == 0) player1.vel = { x: 1, y: 0 }
    player1.key = ''

    player1.pos.x = (player1.pos.x + player1.vel.x + game.grids) % game.grids
    player1.pos.y = (player1.pos.y + player1.vel.y + game.grids) % game.grids
    player1.snake.unshift({ x: player1.pos.x, y: player1.pos.y })
    if (player1.pos.x != game.apple.x || player1.pos.y != game.apple.y) player1.snake.pop()
    else reset = true

    if (
        player1.snake.length > 3 &&
        (player1.snake.slice(1).some((c) => player1.pos.x == c.x && player1.pos.y == c.y) ||
            player1.snake.slice(1).some((c) => player1.pos.x == c.x && player1.pos.y == c.y))
    )
        player1.snake.pop()

    if (player2.key == 'ArrowDown' && player2.vel.y == 0) player2.vel = { x: 0, y: 1 }
    else if (player2.key == 'ArrowUp' && player2.vel.y == 0) player2.vel = { x: 0, y: -1 }
    else if (player2.key == 'ArrowLeft' && player2.vel.x == 0) player2.vel = { x: -1, y: 0 }
    else if (player2.key == 'ArrowRight' && player2.vel.x == 0) player2.vel = { x: 1, y: 0 }
    player2.key = ''
    player2.pos.x = (player2.pos.x + player2.vel.x + game.grids) % game.grids
    player2.pos.y = (player2.pos.y + player2.vel.y + game.grids) % game.grids
    player2.snake.unshift({ x: player2.pos.x, y: player2.pos.y })
    if (player2.pos.x != game.apple.x || player2.pos.y != game.apple.y) player2.snake.pop()
    else reset = true
    if (
        player2.snake.length > 3 &&
        (player1.snake.slice(1).some((c) => player2.pos.x == c.x && player2.pos.y == c.y) ||
            player2.snake.slice(1).some((c) => player2.pos.x == c.x && player2.pos.y == c.y))
    )
        player2.snake.pop()

    if (reset) {
        game.apple.x = randomInRange(0, game.grids - 1)
        game.apple.y = randomInRange(0, game.grids - 1)
    }

    io.emit('game', game)
}, 200)

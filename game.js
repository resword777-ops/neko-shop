
"use strict";

// 🐱 NEKO SHOP — игровой движок

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 520;

// Игровое состояние
const game = {
  money: 250,
  sold: 0,
  level: 1,
  day: 1,
  running: true
};

// Кошкодевочка
const player = {
  x: 400,
  y: 350,
  speed: 3,
  size: 20,
  color: "#f2b6ce"
};

// Управление
const keys = {};

window.addEventListener("keydown", event => {
  keys[event.key.toLowerCase()] = true;

  if (event.key.toLowerCase() === "e") {
    interact();
  }
});

window.addEventListener("keyup", event => {
  keys[event.key.toLowerCase()] = false;
});

// Товары магазина
const products = [
  { name: "Молоко", emoji: "🥛", price: 16, stock: 5 },
  { name: "Тортик", emoji: "🧁", price: 25, stock: 5 },
  { name: "Клубника", emoji: "🍓", price: 12, stock: 5 },
  { name: "Игрушка", emoji: "🧸", price: 32, stock: 5 }
];

// Игровые объекты
const shelves = [
  { x: 200, y: 120, product: 0 },
  { x: 340, y: 120, product: 1 },
  { x: 480, y: 120, product: 2 },
  { x: 620, y: 120, product: 3 }
];

const box = { x: 90, y: 400 };
const cashRegister = { x: 690, y: 300 };

let carrying = null;
let customers = [];
let message = "Добро пожаловать в Neko Shop! ♡";

// Проверка расстояния
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Столкновения со стенами и мебелью
function collides(x, y) {
  if (x < 25 || x > 775 || y < 55 || y > 495) {
    return true;
  }

  const objects = [
    { x: box.x, y: box.y, w: 45, h: 40 },
    { x: cashRegister.x, y: cashRegister.y, w: 70, h: 50 },
    ...shelves.map(s => ({
      x: s.x,
      y: s.y,
      w: 85,
      h: 40
    }))
  ];

  return objects.some(o =>
    Math.abs(x - o.x) < o.w / 2 + player.size / 2 &&
    Math.abs(y - o.y) < o.h / 2 + player.size / 2
  );
}

// Движение персонажа
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys.w || keys.arrowup) dy--;
  if (keys.s || keys.arrowdown) dy++;
  if (keys.a || keys.arrowleft) dx--;
  if (keys.d || keys.arrowright) dx++;

  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  const nx = player.x + dx * player.speed;
  const ny = player.y + dy * player.speed;

  if (!collides(nx, player.y)) player.x = nx;
  if (!collides(player.x, ny)) player.y = ny;
}

// Действие E
function interact() {
  if (distance(player, box) < 55) {
    if (carrying === null) {
      carrying = products.find(p => p.stock > 0);

      if (carrying) {
        message = "Ты взяла " + carrying.name + "! ♡";
      } else {
        message = "Коробка пуста! Закажи поставку.";
      }
    } else {
      const shelf = shelves.find(s =>
        s.product === products.indexOf(carrying) &&
        distance(player, s) < 60
      );

      if (shelf) {
        message = "Товар успешно размещён!";
        carrying = null;
      } else {
        message = "Найди подходящую полку!";
      }
    }

    return;
  }

  const shelf = shelves.find(s => distance(player, s) < 55);

  if (shelf) {
    const product = products[shelf.product];

    if (product.stock > 0) {
      product.stock--;
      game.money += product.price;
      game.sold++;
      message = "Продажа: " + product.name +
        " за " + product.price + " ₸!";
    } else {
      message = "Этот товар закончился!";
    }

    updateStats();
    return;
  }

  if (distance(player, cashRegister) < 60) {
    message = "Касса готова к работе! 💗";
    return;
  }

  message = "Подойди к коробке, полке или кассе.";
}

// Рисование кошкодевочки
function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Тело
  ctx.fillStyle = player.color;
  ctx.beginPath();
  ctx.ellipse(0, 5, 13, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Голова
  ctx.beginPath();
  ctx.arc(0, -12, 15, 0, Math.PI * 2);
  ctx.fill();

  // Кошачьи ушки
  ctx.beginPath();
  ctx.moveTo(-13, -20);
  ctx.lineTo(-17, -35);
  ctx.lineTo(-4, -27);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(4, -27);
  ctx.lineTo(17, -35);
  ctx.lineTo(13, -20);
  ctx.fill();

  // Глазки
  ctx.fillStyle = "#654052";
  ctx.beginPath();
  ctx.arc(-5, -13, 2, 0, Math.PI * 2);
  ctx.arc(5, -13, 2, 0, Math.PI * 2);
  ctx.fill();

  // Румянец
  ctx.fillStyle = "#e88eac";
  ctx.beginPath();
  ctx.arc(-9, -8, 3, 0, Math.PI * 2);
  ctx.arc(9, -8, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Рисование полок
function drawShelf(shelf) {
  ctx.fillStyle = "#bd8b75";
  ctx.fillRect(shelf.x - 42, shelf.y - 20, 84, 40);

  ctx.fillStyle = "#fff0dc";
  ctx.fillRect(shelf.x - 37, shelf.y - 15, 74, 30);

  const product = products[shelf.product];

  ctx.font = "23px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(product.emoji, shelf.x, shelf.y + 8);

  ctx.font = "12px sans-serif";
  ctx.fillStyle = "#754c58";
  ctx.fillText(product.stock + " шт.", shelf.x, shelf.y + 34);
}

// Рисование всего мира
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Кремовый пол
  ctx.fillStyle = "#f4e5d0";
  ctx.fillRect(0, 0, 800, 520);

  // Плитка
  for (let y = 0; y < 520; y += 32) {
    for (let x = 0; x < 800; x += 32) {
      ctx.fillStyle =
        (x / 32 + y / 32) % 2
          ? "#f7ebdc"
          : "#f0dfcc";

      ctx.fillRect(x, y, 31, 31);
    }
  }

  // Стены
  ctx.fillStyle = "#c99485";
  ctx.fillRect(10, 40, 780, 9);
  ctx.fillRect(10, 40, 9, 470);
  ctx.fillRect(781, 40, 9, 470);
  ctx.fillRect(10, 501, 780, 9);

  // Коробка поставок
  ctx.fillStyle = "#c79a70";
  ctx.fillRect(box.x - 22, box.y - 20, 44, 40);
  ctx.font = "25px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("📦", box.x, box.y + 8);

  shelves.forEach(drawShelf);

  // Касса
  ctx.fillStyle = "#dfa8bb";
  ctx.fillRect(
    cashRegister.x - 35,
    cashRegister.y - 25,
    70,
    50
  );

  ctx.font = "25px sans-serif";
  ctx.fillText("🧾", cashRegister.x, cashRegister.y + 8);

  drawPlayer();

  // Интерфейс
  ctx.fillStyle = "#805363";
  ctx.font = "bold 17px sans-serif";
  ctx.textAlign = "left";

  ctx.fillText("🐱 NEKO SHOP", 30, 75);

  ctx.font = "14px sans-serif";
  ctx.fillText("День: " + game.day, 30, 100);
  ctx.fillText("Деньги: " + game.money + " ₸", 30, 120);

  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(180, 455, 440, 35);

  ctx.fillStyle = "#805363";
  ctx.textAlign = "center";
  ctx.fillText(message, 400, 477);
}

// Интерфейс
function updateStats() {
  document.querySelector("#money").textContent = game.money;
  document.querySelector("#sold").textContent = game.sold;
  document.querySelector("#level").textContent = game.level;
  document.querySelector("#carry").textContent =
    carrying ? carrying.name : "нет";
}

// Игровой цикл
function gameLoop() {
  if (!game.running) return;

  updatePlayer();
  render();
  updateStats();

  requestAnimationFrame(gameLoop);
}

// Покупка товаров
document.querySelector("#delivery").onclick = () => {
  if (game.money < 40) {
    message = "Не хватает денег на поставку!";
    return;
  }

  game.money -= 40;
  products.forEach(p => p.stock += 3);
  message = "Новая поставка прибыла! 📦";
};

// Расширение магазина
document.querySelector("#expand").onclick = () => {
  if (game.money < 180) {
    message = "Нужно 180 ₸ для расширения!";
    return;
  }

  game.money -= 180;
  game.level++;

  shelves.push({
    x: 200 + Math.random() * 400,
    y: 210 + Math.random() * 80,
    type: 0,
    product: 0,
    n: 0,
    max: 5
  });

  message = "Магазин расширен! 🏪";
};

// Смена наряда
document.querySelector("#outfit").onclick = () => {
  const colors = ["#f2b6ce", "#a8d8ed", "#d6b8f0"];
  outfit = (outfit + 1) % colors.length;
  player.color = colors[outfit];
  message = "Новый наряд! 🎀";
};

// Покупка декора
document.querySelector("#decorate").onclick = () => {
  if (game.money < 30) {
    message = "Не хватает денег!";
    return;
  }

  game.money -= 30;

  decorations.push({
    x: 100 + Math.random() * 600,
    y: 250 + Math.random() * 180
  });

  message = "Ты купила цветок! 🌸";
};

// Кнопки
document.querySelector("#action").onclick = interact;

// Сохранение
document.querySelector("#save").onclick = () => {
  const data = {
    game, player, products, shelves,
    decorations, stock, sold, money, level
  };

  localStorage.setItem("nekoShopSave", JSON.stringify(data));
  message = "Прогресс сохранён! 💾";
};

// Сенсорные кнопки
document.querySelectorAll("[data-key]").forEach(button => {
  const key = button.dataset.key.toLowerCase();

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    keys[key] = true;
    button.setPointerCapture(e.pointerId);
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach(event => {
    button.addEventListener(event, () => keys[key] = false);
  });
});

gameLoop();

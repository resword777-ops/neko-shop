
"use strict";

// 🐱 NEKO SHOP — игровой движок

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

canvas.width = 1100;
canvas.height = 720;

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
  { name: "Игрушка", emoji: "🧸", price: 32, stock: 5 },

  { name: "Клубничное молоко", emoji: "🍓", price: 20, stock: 8 },
  { name: "Онигири", emoji: "🍙", price: 18, stock: 8 },
  { name: "Печенье", emoji: "🍪", price: 14, stock: 8 },
  { name: "Конфеты", emoji: "🍬", price: 12, stock: 10 },
  { name: "Пудинг", emoji: "🍮", price: 22, stock: 6 },
  { name: "Чай боба", emoji: "🧋", price: 28, stock: 6 },
  { name: "Рамен", emoji: "🍜", price: 30, stock: 5 },
  { name: "Пончик", emoji: "🍩", price: 17, stock: 8 },
];
// Игровые объекты

const shelves = [
  { x: 180, y: 170, product: 0 },
  { x: 360, y: 170, product: 1 },
  { x: 540, y: 170, product: 2 },
  { x: 720, y: 170, product: 3 },

  { x: 180, y: 290, product: 4 },
  { x: 360, y: 290, product: 5 },
  { x: 540, y: 290, product: 6 },
  { x: 720, y: 290, product: 7 },

  { x: 180, y: 410, product: 8 },
  { x: 360, y: 410, product: 9 },
  { x: 540, y: 410, product: 10 },
  { x: 720, y: 410, product: 11 },

];


const box = { x: 100, y: 630 };
const cashRegister = { x: 950, y: 630 };

let carrying = null;
// Дополнительные данные игры
let decorations = [];
let outfit = 0;
let stock = 20;
let customers = [];
let message = "Добро пожаловать в Neko Shop! ♡";

// Проверка расстояния
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Столкновения со стенами и мебелью

function collides(x, y) {
  // Границы большого магазина
  if (
    x < 35 ||
    x > canvas.width - 35 ||
    y < 70 ||
    y > canvas.height - 35
  ) {
    return true;
  }

  const objects = [
    { x: box.x, y: box.y, w: 45, h: 40 },
    {
      x: cashRegister.x,
      y: cashRegister.y,
      w: 70,
      h: 50
    },
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
let walkFrame = 0;
let isWalking = false;
let lastPlayerX = 0;
let lastPlayerY = 0;

// Рисование кошкодевочки
function drawPlayer() {
  
const t = performance.now() / 250;

ctx.save();

// Анимация шагов
if (isWalking) {
  walkFrame += 0.22;
}

const step = Math.sin(walkFrame);
const bounce = isWalking
  ? Math.abs(step) * 2
  : 0;

ctx.translate(player.x, player.y - bounce);
ctx.rotate(isWalking ? step * 0.035 : 0);

  // Мягкая тень
  ctx.fillStyle = "rgba(65, 35, 60, 0.20)";
  ctx.beginPath();
  ctx.ellipse(0, 9, 21, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Хвостик с анимацией
  ctx.strokeStyle = "#292331";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(9, 5);
  ctx.quadraticCurveTo(
    25, 2 + Math.sin(t) * 5,
    19, -9 + Math.cos(t) * 4
  );
  ctx.stroke();

  ctx.strokeStyle = "#f4a2c8";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(11, 5);
  ctx.quadraticCurveTo(
    24, 2 + Math.sin(t) * 5,
    19, -9 + Math.cos(t) * 4
  );
  ctx.stroke();

 
  // Ножки с анимацией ходьбы
  const legSwing = isWalking
    ? Math.sin(walkFrame) * 3
    : 0;

  ctx.fillStyle = "#292331";

  ctx.beginPath();
  ctx.ellipse(
    -8 - legSwing, 11,
    6, 7,
    isWalking ? -0.2 - legSwing * 0.04 : -0.2,
    0, Math.PI * 2
  );
  ctx.ellipse(
    8 + legSwing, 11,
    6, 7,
    isWalking ? 0.2 + legSwing * 0.04 : 0.2,
    0, Math.PI * 2
  );
  ctx.fill();

  // Платье
  ctx.fillStyle = "#302638";
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.quadraticCurveTo(-17, 5, -19, 13);
  ctx.quadraticCurveTo(0, 19, 19, 13);
  ctx.quadraticCurveTo(17, 5, 11, -3);
  ctx.closePath();
  ctx.fill();

  // Розовая юбка
  ctx.fillStyle = "#f5a0ca";
  ctx.beginPath();
  ctx.moveTo(-10, 1);
  ctx.quadraticCurveTo(-14, 8, -18, 13);
  ctx.quadraticCurveTo(0, 18, 18, 13);
  ctx.quadraticCurveTo(14, 8, 10, 1);
  ctx.closePath();
  ctx.fill();

  // Оборки
  ctx.strokeStyle = "#fff0f7";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-15, 12);
  ctx.quadraticCurveTo(-10, 8, -6, 13);
  ctx.quadraticCurveTo(0, 17, 5, 13);
  ctx.quadraticCurveTo(11, 8, 15, 12);
  ctx.stroke();

  // Руки
  ctx.strokeStyle = "#fff4f4";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-10, -1);
  ctx.lineTo(-16, 7);
  ctx.moveTo(10, -1);
  ctx.lineTo(16, 7);
  ctx.stroke();

  // Белые лапки
  ctx.fillStyle = "#fff4f4";
  ctx.beginPath();
  ctx.arc(-16, 8, 4, 0, Math.PI * 2);
  ctx.arc(16, 8, 4, 0, Math.PI * 2);
  ctx.fill();

  // Голова
  ctx.fillStyle = "#302638";
  ctx.beginPath();
  ctx.ellipse(0, -17, 19, 19, 0, 0, Math.PI * 2);
  ctx.fill();

  // Длинные ушки шапочки
  ctx.beginPath();
  ctx.moveTo(-14, -28);
  ctx.quadraticCurveTo(-24, -37, -24, -46);
  ctx.quadraticCurveTo(-12, -43, -5, -31);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(7, -31);
  ctx.quadraticCurveTo(17, -44, 26, -43);
  ctx.quadraticCurveTo(25, -30, 14, -24);
  ctx.closePath();
  ctx.fill();

  // Розовая внутренняя часть ушек
  ctx.fillStyle = "#f6a1ca";
  ctx.beginPath();
  ctx.moveTo(-15, -32);
  ctx.lineTo(-21, -42);
  ctx.lineTo(-10, -34);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(13, -31);
  ctx.lineTo(22, -40);
  ctx.lineTo(17, -29);
  ctx.closePath();
  ctx.fill();

  // Мягкая белая мордочка
  ctx.fillStyle = "#fff8f3";
  ctx.beginPath();
  ctx.ellipse(0, -14, 14, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Щёчки
  ctx.fillStyle = "#ffb3ce";
  ctx.beginPath();
  ctx.ellipse(-10, -11, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.ellipse(10, -11, 4, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Большие блестящие глазки
  ctx.fillStyle = "#493047";
  ctx.beginPath();
  ctx.ellipse(-5.5, -17, 3.1, 4.5, 0, 0, Math.PI * 2);
  ctx.ellipse(5.5, -17, 3.1, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Блики в глазах
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-6.3, -19, 1.3, 0, Math.PI * 2);
  ctx.arc(4.7, -19, 1.3, 0, Math.PI * 2);
  ctx.fill();

  // Носик
  ctx.fillStyle = "#e783ab";
  ctx.beginPath();
  ctx.moveTo(-2, -12);
  ctx.lineTo(2, -12);
  ctx.lineTo(0, -10);
  ctx.closePath();
  ctx.fill();

  // Розовый черепок на лбу
  ctx.fillStyle = "#ffb7d8";
  ctx.beginPath();
  ctx.arc(0, -29, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-3.5, -27, 7, 4);

  ctx.fillStyle = "#8d456c";
  ctx.beginPath();
  ctx.arc(-1.7, -30, 1, 0, Math.PI * 2);
  ctx.arc(1.7, -30, 1, 0, Math.PI * 2);
  ctx.fill();

  // Бантик на платье
  ctx.fillStyle = "#ffcae2";
  ctx.beginPath();
  ctx.moveTo(-2, 2);
  ctx.lineTo(-10, -2);
  ctx.lineTo(-9, 6);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(2, 2);
  ctx.lineTo(10, -2);
  ctx.lineTo(9, 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e86da6";
  ctx.beginPath();
  ctx.arc(0, 2, 3, 0, Math.PI * 2);
  ctx.fill();

  // Маленькие декоративные блёстки
  ctx.fillStyle = "#fff1f8";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦", -19, -18);
  ctx.fillText("✦", 18, -8);

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
function render() {console.log("RENDER запущен");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "red";
ctx.fillRect(0, 0, 200, 100);
ctx.fillStyle = "white";
ctx.font = "24px sans-serif";
ctx.fillText("TEST", 20, 60);
  // Кремовый пол
  ctx.fillStyle = "#f4e5d0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Плитка
  for (let y = 0; y < canvas.height; y += 32) {
  for (let x = 0; x < canvas.width; x += 32) {
      ctx.fillStyle =
        (x / 32 + y / 32) % 2
          ? "#f7ebdc"
          : "#f0dfcc";

      ctx.fillRect(x, y, 31, 31);
    }
  }

  
  // Стены большого магазина
  ctx.fillStyle = "#c99485";

  // Верхняя стена
  ctx.fillRect(10, 30, canvas.width - 20, 12);

  // Левая стена
  ctx.fillRect(0, 40, 12, canvas.height - 40);

  // Правая стена
  ctx.fillRect(
    canvas.width - 12,
    40,
    30,
    canvas.height - 40
  );

  // Нижняя стена с проходом у входа
  ctx.fillRect(10, canvas.height - 10, 300, 12);
  ctx.fillRect(410, canvas.height - 10, canvas.width - 420, 12);

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
    cashRegister.x - 25,
    cashRegister.y - 20,
    50,
    40
  );

  ctx.font = "25px sans-serif";
  ctx.fillText("🧾", cashRegister.x, cashRegister.y + 8);

  drawPlayer();
console.log("Куроми нарисована");
  // Интерфейс
  ctx.fillStyle = "#805363";
  ctx.font = "bold 17px sans-serif";
  ctx.textAlign = "left";

  ctx.fillText("🐱 NEKO SHOP", 30, 75);

  ctx.font = "14px sans-serif";
  ctx.fillText("День: " + game.day, 30, 100);
  ctx.fillText("Деньги: " + game.money + " ₸", 30, 120);

  ctx.fillStyle = "#fff8ef";
  ctx.fillRect(310, 75, 440, 35);

  ctx.fillStyle = "#805363";
  ctx.textAlign = "center";
  ctx.fillText(message, 530, 100);
}

// Интерфейс
function updateStats() {
  const moneyElement = document.querySelector("#money");
  const soldElement = document.querySelector("#sold");
  const levelElement = document.querySelector("#level");
  const carryElement = document.querySelector("#carry");

  if (moneyElement) {
    moneyElement.textContent = game.money;
  }

  if (soldElement) {
    soldElement.textContent = game.sold;
  }

  if (levelElement) {
    levelElement.textContent = game.level;
  }

  if (carryElement) {
    carryElement.textContent = carrying ? carrying.name : "нет";
  }
}

// Игровой цикл

function gameLoop() {
  if (!game.running) return;

  const oldX = player.x;
  const oldY = player.y;

  updatePlayer();

  isWalking =
    Math.abs(player.x - oldX) > 0.01 ||
    Math.abs(player.y - oldY) > 0.01;

  if (isWalking) {
    walkFrame += 0.22;
  }

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
    game,
    player,
    products,
    shelves,
    decorations,
    stock,
    carrying
  };

  localStorage.setItem("nekoShopSave", JSON.stringify(data));
  message = "Прогресс сохранён! 💾";
};

// Сенсорные кнопки

const joystick = document.querySelector("#joystick");
const stick = document.querySelector("#stick");
const mobileAction = document.querySelector("#mobileAction");

if (joystick && stick) {
  let joystickPointer = null;

  function moveStick(event) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const maxDistance = 35;
    const distance = Math.hypot(dx, dy);

    if (distance > maxDistance) {
      dx = dx / distance * maxDistance;
      dy = dy / distance * maxDistance;
    }

    keys.a = dx < -8;
    keys.d = dx > 8;
    keys.w = dy < -8;
    keys.s = dy > 8;

    stick.style.left = `${35 + dx}px`;
    stick.style.top = `${35 + dy}px`;
  }

  function releaseStick() {
    joystickPointer = null;
    keys.a = keys.d = keys.w = keys.s = false;
    stick.style.left = "35px";
    stick.style.top = "35px";
  }

  joystick.addEventListener("pointerdown", event => {
    event.preventDefault();
    joystickPointer = event.pointerId;
    joystick.setPointerCapture(event.pointerId);
    moveStick(event);
  });

  joystick.addEventListener("pointermove", event => {
    if (event.pointerId === joystickPointer) {
      moveStick(event);
    }
  });

  joystick.addEventListener("pointerup", releaseStick);
  joystick.addEventListener("pointercancel", releaseStick);
  joystick.addEventListener("lostpointercapture", releaseStick);
}

if (mobileAction) {
  mobileAction.addEventListener("click", () => interact());
}

gameLoop();

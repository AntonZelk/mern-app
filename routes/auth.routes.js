const { Router } = require('express');
//шифрование пароля
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const router = Router();

// /api/auth/register т.к. в апп мы уже указали путь
router.post(
  '/register',
  // параметры валидации из библиотеки
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации',
        });
      }

      //берется из фронтенд
      const { email, password } = req.body;
      //ищет в бд пользователя с таким мылом
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: 'Такой пользователь уже существует' });
      }
      // шифрует пароль
      const hashedPassword = await bcrypt.hash(password, 12);
      //создаем нового пользователя
      const user = new User({ email, password: hashedPassword });
      //сохраняем его в бд
      await user.save();

      res.status(201).json({ message: 'Пользователь создан' });
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  }
);

// /api/auth/login т.к. в апп мы уже указали путь
router.post(
  '/login',
  [
    check('email', 'Введите корректный email').normalizeEmail().isEmail(),
    //пароль должен существовать
    check('password', 'Введите пароль').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при входе в систему',
        });
      }
      //берем из фронтенд
      const { email, password } = req.body;
      //ищем в бд такого пользователя по мылу
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
      }
      //совпадают ли пароли и сравнивает с захешированным паролем, первый аргумент получаем из фронт - password, второй user.password берем из бд
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'Неверный пароль, попробуйте снова' });
      }

      const token = jwt.sign(
        { userId: user.id },
        //берем серетный ключ из конфига
        config.get('jwtSecret'),
        //через сколько токен закончит своё существование(1час)
        { expiresIn: '1h' }
      );

      res.json({ token, userId: user.id });
    } catch (e) {
      res
        .status(500)
        .json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
  }
);

module.exports = router;

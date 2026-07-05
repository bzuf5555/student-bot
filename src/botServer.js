export class BotServer {
  constructor({ telegramClient, storage, logger }) {
    this.telegramClient = telegramClient;
    this.storage = storage;
    this.logger = logger;
    this.offset = 0;
    this.stopped = false;
  }

  start() {
    this.loop();
  }

  stop() {
    this.stopped = true;
  }

  async loop() {
    while (!this.stopped) {
      try {
        const updates = await this.telegramClient.getUpdates(this.offset, 25);
        for (const update of updates) {
          this.offset = update.update_id + 1;
          await this.handleUpdate(update);
        }
      } catch (error) {
        this.logger.error({ error: error.message }, 'bot polling failed');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async handleUpdate(update) {
    const message = update.message;
    if (!message?.chat || message.chat.type !== 'private') return;
    const text = message.text || '';
    const from = message.from || {};

    if (text.startsWith('/start')) {
      await this.storage.upsertRegistration({
        chatId: message.chat.id,
        telegramId: from.id,
        username: from.username,
        firstName: from.first_name,
        lastName: from.last_name
      });
      await this.telegramClient.sendMessage(
        message.chat.id,
        [
          'Assalomu alaykum!',
          '',
          "Siz muvaffaqiyatli ro'yxatdan o'tdingiz. Endi dars vaqti yaqinlashganda shu chatga xabarnoma keladi.",
          '',
          "Agar xabar kelmasa, administrator backenddagi Telegram user id yoki username to'g'ri kiritilganini tekshirishi kerak."
        ].join('\n')
      );
      return;
    }

    if (text.startsWith('/status')) {
      await this.telegramClient.sendMessage(message.chat.id, 'Bot faol. Xabarnomalar darsdan 10 daqiqa oldin yuboriladi.');
      return;
    }

    if (text.startsWith('/help')) {
      await this.telegramClient.sendMessage(
        message.chat.id,
        [
          'Buyruqlar:',
          "/start - Telegram profilingizni botga bog'lash",
          '/status - bot holatini tekshirish',
          '/help - yordam'
        ].join('\n')
      );
    }
  }
}

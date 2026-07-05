import { BackendClient } from './backendClient.js';
import { BotServer } from './botServer.js';
import { loadDotEnv, getConfig } from './config.js';
import { createLogger } from './logger.js';
import { ReminderService } from './reminderService.js';
import { JsonStorage, MongoStorage } from './storage.js';
import { TelegramClient } from './telegramClient.js';
import { startHttpServer } from './httpServer.js';

loadDotEnv();

const config = getConfig();
const logger = createLogger(config.logLevel);
const storage = config.mongodbUri
  ? new MongoStorage({ uri: config.mongodbUri, databaseName: config.mongodbDatabase, logger })
  : new JsonStorage(config.dataFile);
const telegramClient = new TelegramClient({ token: config.botToken, logger });
const backendClient = new BackendClient({
  baseUrl: config.backendBaseUrl,
  apiKey: config.backendApiKey,
  logger
});

const botServer = new BotServer({ telegramClient, storage, logger });
const reminderService = new ReminderService({
  backendClient,
  telegramClient,
  storage,
  config,
  logger
});
const httpServer = startHttpServer({ port: config.port, logger });

botServer.start();
reminderService.start();

function shutdown(signal) {
  logger.info({ signal }, 'shutdown requested');
  botServer.stop();
  reminderService.stop();
  httpServer.close(async () => {
    if (typeof storage.close === 'function') await storage.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);


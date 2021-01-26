import { Sequelize } from 'sequelize';
import { SettingCode, Settings } from './../models/Settings';

export class SettingsService {
    constructor(private db: Sequelize) {
        this.db = db;
    }

    async getSize() {
        const windowSize = await Settings.findOne({
            where: {
                code: SettingCode.WindowSize,
            },
            raw: true,
        });

        if (windowSize === null) {
            return null;
        }

        return windowSize.value.split(',').map(Number);
    }

    async getPosition() {
        const windowSize = await Settings.findOne({
            where: {
                code: SettingCode.WindowPosition,
            },
            raw: true,
        });

        if (windowSize === null) {
            return null;
        }

        return windowSize.value.split(',').map(Number);
    }

    async getSetting(code: SettingCode, raw: boolean = true) {
        return await Settings.findOne({
            where: { code },
            raw,
        });
    }

    async saveSetting(code: SettingCode, value: string) {
        const setting = await this.getSetting(code, false);

        let result: Settings;
        if (setting === null) {
            result = await Settings.create({ code, value });
        } else {
            result = await setting.update({ value });
        }

        return result.toJSON();
    }
}

let _settingsService: SettingsService = null;

export function initSettingsService(db: Sequelize) {
    _settingsService = new SettingsService(db);
    return getSettingsService();
}

export function getSettingsService() {
    return _settingsService;
}

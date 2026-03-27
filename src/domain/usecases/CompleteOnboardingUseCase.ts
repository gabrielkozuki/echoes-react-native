import { ISettingsRepository } from '@/domain/models/ISettingsRepository';

export class CompleteOnboardingUseCase {
  constructor(private readonly settingsRepository: ISettingsRepository) {}

  async execute(): Promise<void> {
    await this.settingsRepository.set('onboarding_completed', 'true');
  }
}

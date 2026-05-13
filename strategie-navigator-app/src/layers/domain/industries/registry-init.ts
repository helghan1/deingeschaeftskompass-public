import { industryRegistry } from './engine';
import { ServiceOfflineIndustryEngine } from './service/engine';
import { ServiceOnlineIndustryEngine } from './service-online/engine';
import { TradeIndustryEngine } from './trade/engine';
import { CraftIndustryEngine } from './craft/engine';

// Register all available industry engines
export const initIndustryEngines = () => {
  industryRegistry.register(new ServiceOfflineIndustryEngine());
  industryRegistry.register(new ServiceOnlineIndustryEngine());
  industryRegistry.register(new TradeIndustryEngine());
  industryRegistry.register(new CraftIndustryEngine());
};

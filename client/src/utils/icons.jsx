import {
  IconBuildingMonument, IconMasksTheater, IconRestaurant, IconBuilding,
  IconBuildingStore, IconBus, IconHeartPlus, IconSchool,
  IconBuildingGovernment, IconBallFootball, IconTree, IconBuildingBank,
  IconBuildings, IconChurch, IconCross,
  IconMapPin, IconMapPinFilled, IconBuildingCommunity, IconRoad,
  IconWalk, IconBike, IconCar, IconMotorbike,
  IconShield, IconScale, IconBolt,
  IconStar, IconStarFilled,
} from '@tabler/icons-react';

const CATEGORY_MAP = {
  turismo: IconBuildingMonument,
  cultura: IconMasksTheater,
  restaurante: IconRestaurant,
  hotel: IconBuilding,
  comercio: IconBuildingStore,
  transporte: IconBus,
  salud: IconHeartPlus,
  educacion: IconSchool,
  gobierno: IconBuildingGovernment,
  deporte: IconBallFootball,
  parque: IconTree,
  banco: IconBuildingBank,
  barrio: IconBuildings,
  religion: IconChurch,
  entierro: IconCross,
};

const MODE_MAP = {
  walking: IconWalk,
  bike: IconBike,
  car: IconCar,
  motorcycle: IconMotorbike,
};

const ROUTE_TYPE_MAP = {
  safest: IconShield,
  balanced: IconScale,
  fastest: IconBolt,
};

export function getLandmarkIcon(category, size = 18) {
  const Icon = CATEGORY_MAP[category] || IconMapPin;
  return <Icon size={size} stroke={1.5} />;
}

export function getModeIcon(mode, size = 18) {
  const Icon = MODE_MAP[mode] || IconWalk;
  return <Icon size={size} stroke={1.5} />;
}

export function getRouteTypeIcon(type, size = 16) {
  const Icon = ROUTE_TYPE_MAP[type] || IconMapPin;
  return <Icon size={size} stroke={1.5} />;
}

export function getResultIcon(result, size = 18) {
  if (result.isLandmark && result.category) {
    return getLandmarkIcon(result.category, size);
  }
  if (result.isZone) return <IconBuildingCommunity size={size} stroke={1.5} />;
  if (result.isIntersection) return <IconMapPinFilled size={size} stroke={1.5} />;
  if (result.isStreet) return <IconRoad size={size} stroke={1.5} />;
  return <IconMapPin size={size} stroke={1.5} />;
}

export { IconMapPin, IconMapPinFilled, IconBuildingCommunity, IconRoad, IconStar, IconStarFilled };

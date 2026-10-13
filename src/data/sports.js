// Catalog of sports & featured leagues available in TheSportsDB.
// `name` must match TheSportsDB `strSport` exactly (used in API queries).
// League ids verified against lookupleague.php.

const sports = [
  {
    name: 'Soccer',
    title: 'Football',
    emoji: '⚽',
    color: '#FFD23F',
    leagues: [
      { id: '4328', name: 'English Premier League', country: 'England' },
      { id: '4335', name: 'Spanish La Liga', country: 'Spain' },
      { id: '4332', name: 'Italian Serie A', country: 'Italy' },
      { id: '4331', name: 'German Bundesliga', country: 'Germany' },
      { id: '4334', name: 'French Ligue 1', country: 'France' },
      { id: '4480', name: 'UEFA Champions League', country: 'Europe' },
      { id: '4400', name: 'Spanish La Liga 2', country: 'Spain' },
    ],
  },
  {
    name: 'Basketball',
    title: 'Basketball',
    emoji: '🏀',
    color: '#FFFFFF',
    leagues: [
      { id: '4387', name: 'NBA', country: 'USA' },
      { id: '4546', name: 'EuroLeague Basketball', country: 'Europe' },
    ],
  },
  {
    name: 'Ice Hockey',
    title: 'Ice Hockey',
    emoji: '🏒',
    color: '#6EC6FF',
    leagues: [
      { id: '4380', name: 'NHL', country: 'USA / Canada' },
      { id: '4920', name: 'Russian KHL', country: 'Russia' },
    ],
  },
  {
    name: 'American Football',
    title: 'American Football',
    emoji: '🏈',
    color: '#FFE27A',
    leagues: [
      { id: '4391', name: 'NFL', country: 'USA' },
      { id: '4479', name: 'NCAA Division 1 Football', country: 'USA' },
    ],
  },
  {
    name: 'Baseball',
    title: 'Baseball',
    emoji: '⚾',
    color: '#FFFFFF',
    leagues: [{ id: '4424', name: 'MLB', country: 'USA' }],
  },
  {
    name: 'Motorsport',
    title: 'Motorsport',
    emoji: '🏎️',
    color: '#FFD23F',
    leagues: [
      { id: '4370', name: 'Formula 1', country: 'World' },
      { id: '4407', name: 'MotoGP', country: 'World' },
      { id: '4573', name: "NASCAR O'Reilly Auto Parts Series", country: 'USA' },
    ],
  },
  {
    name: 'Tennis',
    title: 'Tennis',
    emoji: '🎾',
    color: '#6EC6FF',
    leagues: [
      { id: '4464', name: 'ATP World Tour', country: 'World' },
      { id: '4517', name: 'WTA Tour', country: 'World' },
    ],
  },
  {
    name: 'Fighting',
    title: 'Fighting',
    emoji: '🥊',
    color: '#FFE27A',
    leagues: [{ id: '4443', name: 'UFC', country: 'World' }],
  },
  {
    name: 'Rugby',
    title: 'Rugby',
    emoji: '🏉',
    color: '#FFFFFF',
    leagues: [
      { id: '4714', name: 'Six Nations Championship', country: 'Europe' },
      { id: '4416', name: 'Australian National Rugby League', country: 'Australia' },
    ],
  },
  {
    name: 'Cricket',
    title: 'Cricket',
    emoji: '🏏',
    color: '#6EC6FF',
    leagues: [{ id: '4460', name: 'Indian Premier League', country: 'India' }],
  },
  {
    name: 'Volleyball',
    title: 'Volleyball',
    emoji: '🏐',
    color: '#FFD23F',
    leagues: [{ id: '4545', name: 'Russian Volleyball Super League', country: 'Russia' }],
  },
];

export const DEFAULT_FOLLOWED_SPORTS = ['Soccer', 'Basketball', 'Ice Hockey'];

export const getSport = (name) => sports.find((s) => s.name === name);

export const sportEmoji = (name) => getSport(name)?.emoji || '🏅';

export default sports;

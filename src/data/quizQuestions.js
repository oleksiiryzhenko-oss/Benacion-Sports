// Sports quiz. `answer` = index of the correct option.

export const QUIZ_CATEGORIES = [
  { key: 'mixed', title: 'Mixed', emoji: '🎲' },
  { key: 'football', title: 'Football', emoji: '⚽' },
  { key: 'basketball', title: 'Basketball', emoji: '🏀' },
  { key: 'tennis', title: 'Tennis', emoji: '🎾' },
  { key: 'olympics', title: 'Olympics', emoji: '🥇' },
  { key: 'motorsport', title: 'Motorsport', emoji: '🏎️' },
  { key: 'hockey', title: 'Hockey & more', emoji: '🏒' },
];

const quizQuestions = [
  // FOOTBALL
  { category: 'football', question: 'How many players does each team have on the pitch in football?', options: ['9', '10', '11', '12'], answer: 2 },
  { category: 'football', question: 'Which country has won the most FIFA World Cups?', options: ['Germany', 'Brazil', 'Italy', 'Argentina'], answer: 1 },
  { category: 'football', question: 'Which club has won the most UEFA Champions League titles?', options: ['AC Milan', 'Barcelona', 'Bayern Munich', 'Real Madrid'], answer: 3 },
  { category: 'football', question: 'How long is a standard football match (regular time)?', options: ['80 minutes', '90 minutes', '100 minutes', '120 minutes'], answer: 1 },
  { category: 'football', question: 'Which country hosted the first FIFA World Cup in 1930?', options: ['Brazil', 'Italy', 'Uruguay', 'France'], answer: 2 },
  { category: 'football', question: 'What is the nickname of Manchester United?', options: ['The Gunners', 'The Red Devils', 'The Blues', 'The Citizens'], answer: 1 },
  { category: 'football', question: 'Which player has won the most Ballon d\'Or awards?', options: ['Cristiano Ronaldo', 'Lionel Messi', 'Michel Platini', 'Johan Cruyff'], answer: 1 },
  { category: 'football', question: 'What color card means a player is sent off?', options: ['Yellow', 'Green', 'Red', 'Blue'], answer: 2 },
  { category: 'football', question: 'Which English club is known as "The Gunners"?', options: ['Chelsea', 'Arsenal', 'Tottenham', 'West Ham'], answer: 1 },
  { category: 'football', question: 'From what distance is a penalty kick taken?', options: ['9 m', '11 m', '13 m', '16.5 m'], answer: 1 },
  { category: 'football', question: 'Which country won the 2022 FIFA World Cup?', options: ['France', 'Croatia', 'Argentina', 'Brazil'], answer: 2 },
  { category: 'football', question: 'In which city is the Camp Nou stadium?', options: ['Madrid', 'Barcelona', 'Valencia', 'Seville'], answer: 1 },

  // BASKETBALL
  { category: 'basketball', question: 'How many points is a shot from behind the arc worth?', options: ['1', '2', '3', '4'], answer: 2 },
  { category: 'basketball', question: 'How many players per team are on the court in basketball?', options: ['4', '5', '6', '7'], answer: 1 },
  { category: 'basketball', question: 'Which NBA team has Michael Jordan won six titles with?', options: ['Lakers', 'Celtics', 'Bulls', 'Knicks'], answer: 2 },
  { category: 'basketball', question: 'Who invented basketball?', options: ['James Naismith', 'Walter Camp', 'Abner Doubleday', 'William Morgan'], answer: 0 },
  { category: 'basketball', question: 'How long is an NBA quarter?', options: ['10 minutes', '12 minutes', '15 minutes', '20 minutes'], answer: 1 },
  { category: 'basketball', question: 'What is the height of a standard basketball hoop?', options: ['2.85 m', '3.05 m', '3.25 m', '3.50 m'], answer: 1 },
  { category: 'basketball', question: 'Who is the NBA\'s all-time leading scorer?', options: ['Kareem Abdul-Jabbar', 'Michael Jordan', 'LeBron James', 'Kobe Bryant'], answer: 2 },
  { category: 'basketball', question: 'How many seconds is the NBA shot clock?', options: ['20', '24', '30', '35'], answer: 1 },
  { category: 'basketball', question: 'Which team plays home games at Madison Square Garden?', options: ['Brooklyn Nets', 'New York Knicks', 'Boston Celtics', 'Philadelphia 76ers'], answer: 1 },

  // TENNIS
  { category: 'tennis', question: 'Which Grand Slam is played on clay?', options: ['Wimbledon', 'US Open', 'Roland Garros', 'Australian Open'], answer: 2 },
  { category: 'tennis', question: 'What is a score of zero called in tennis?', options: ['Nil', 'Love', 'Zero', 'Duck'], answer: 1 },
  { category: 'tennis', question: 'Which Grand Slam is played on grass?', options: ['Wimbledon', 'US Open', 'Roland Garros', 'Australian Open'], answer: 0 },
  { category: 'tennis', question: 'Who has won the most Roland Garros men\'s titles?', options: ['Roger Federer', 'Novak Djokovic', 'Rafael Nadal', 'Björn Borg'], answer: 2 },
  { category: 'tennis', question: 'What comes after "deuce" if the server wins the point?', options: ['Game', 'Advantage in', 'Set point', 'Break'], answer: 1 },
  { category: 'tennis', question: 'How many Grand Slam tournaments are there each year?', options: ['3', '4', '5', '6'], answer: 1 },
  { category: 'tennis', question: 'In which city is the US Open played?', options: ['Los Angeles', 'Miami', 'New York', 'Chicago'], answer: 2 },

  // OLYMPICS
  { category: 'olympics', question: 'How many rings are on the Olympic flag?', options: ['4', '5', '6', '7'], answer: 1 },
  { category: 'olympics', question: 'Which city hosted the 2024 Summer Olympics?', options: ['Tokyo', 'London', 'Paris', 'Los Angeles'], answer: 2 },
  { category: 'olympics', question: 'Who holds the record for most Olympic gold medals?', options: ['Usain Bolt', 'Michael Phelps', 'Carl Lewis', 'Larisa Latynina'], answer: 1 },
  { category: 'olympics', question: 'In which country did the ancient Olympic Games originate?', options: ['Italy', 'Egypt', 'Greece', 'Turkey'], answer: 2 },
  { category: 'olympics', question: 'How long is a marathon?', options: ['40 km', '42.195 km', '45 km', '50 km'], answer: 1 },
  { category: 'olympics', question: 'Usain Bolt\'s 100 m world record is…', options: ['9.58 s', '9.63 s', '9.69 s', '9.72 s'], answer: 0 },
  { category: 'olympics', question: 'Which city will host the 2028 Summer Olympics?', options: ['Brisbane', 'Los Angeles', 'Madrid', 'Rome'], answer: 1 },
  { category: 'olympics', question: 'How often are the Summer Olympics held?', options: ['Every 2 years', 'Every 3 years', 'Every 4 years', 'Every 5 years'], answer: 2 },
  { category: 'olympics', question: 'Which sport uses the terms "ippon" and "waza-ari"?', options: ['Karate', 'Judo', 'Taekwondo', 'Wrestling'], answer: 1 },

  // MOTORSPORT
  { category: 'motorsport', question: 'How many points does a Formula 1 race winner get?', options: ['10', '15', '20', '25'], answer: 3 },
  { category: 'motorsport', question: 'Which team is known as "the Scuderia" in F1?', options: ['McLaren', 'Mercedes', 'Ferrari', 'Williams'], answer: 2 },
  { category: 'motorsport', question: 'Which driver has the most F1 World Championships (shared record)?', options: ['Ayrton Senna & Alain Prost', 'Lewis Hamilton & Michael Schumacher', 'Sebastian Vettel & Max Verstappen', 'Juan Manuel Fangio & Niki Lauda'], answer: 1 },
  { category: 'motorsport', question: 'What does a chequered flag mean?', options: ['Danger', 'Pit lane open', 'End of the race', 'Last lap'], answer: 2 },
  { category: 'motorsport', question: 'Where is the Monaco Grand Prix held?', options: ['Monte Carlo', 'Nice', 'Cannes', 'Marseille'], answer: 0 },
  { category: 'motorsport', question: 'Which famous race lasts 24 hours?', options: ['Indy 500', 'Le Mans', 'Daytona 500', 'Dakar'], answer: 1 },

  // HOCKEY & OTHERS
  { category: 'hockey', question: 'How many periods are in an ice hockey game?', options: ['2', '3', '4', '5'], answer: 1 },
  { category: 'hockey', question: 'What is the name of the NHL championship trophy?', options: ['Vince Lombardi Trophy', 'Stanley Cup', 'Larry O\'Brien Trophy', 'Commissioner\'s Trophy'], answer: 1 },
  { category: 'hockey', question: 'Who is the NHL\'s all-time leading goal scorer (as of 2025)?', options: ['Wayne Gretzky', 'Gordie Howe', 'Alex Ovechkin', 'Jaromír Jágr'], answer: 2 },
  { category: 'hockey', question: 'How many players per team are on the ice (including goalie)?', options: ['5', '6', '7', '11'], answer: 1 },
  { category: 'hockey', question: 'In volleyball, how many touches can a team make before returning the ball?', options: ['2', '3', '4', 'Unlimited'], answer: 1 },
  { category: 'hockey', question: 'How many points is a touchdown worth in American football?', options: ['3', '6', '7', '2'], answer: 1 },
  { category: 'hockey', question: 'What is the name of the NFL championship game?', options: ['World Series', 'Super Bowl', 'Stanley Cup Final', 'Rose Bowl'], answer: 1 },
  { category: 'hockey', question: 'How many players are on a baseball team\'s field on defense?', options: ['7', '8', '9', '10'], answer: 2 },
  { category: 'hockey', question: 'In which sport would you perform a "slam dunk"?', options: ['Volleyball', 'Basketball', 'Handball', 'Water polo'], answer: 1 },
  { category: 'hockey', question: 'Which sport is played at Wimbledon?', options: ['Cricket', 'Golf', 'Tennis', 'Rugby'], answer: 2 },
  { category: 'hockey', question: 'What is the maximum score in a single game of ten-pin bowling?', options: ['200', '250', '300', '350'], answer: 2 },
  { category: 'hockey', question: 'How many players are on a rugby union team on the field?', options: ['11', '13', '15', '18'], answer: 2 },
];

export default quizQuestions;

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';

import colors from '../utils/colors';
import { formatDateTime } from '../utils/helpers';
import { getGameScore, getGameResult, getSideName, getSideTeam } from '../utils/gameLogic';
import { getRules } from '../data/gameRules';
import { useApp } from '../context/AppContext';
import TeamBadge from './TeamBadge';
import LiveDot from './LiveDot';

// Card for a user-created game
const GameCard = ({ game, onPress, style }) => {
  const { teams, customSports, tournaments } = useApp();
  const rules = getRules(game.sport, customSports);
  const score = getGameScore(game);
  const result = getGameResult(game);
  const home = getSideTeam(game, 'home', teams);
  const away = getSideTeam(game, 'away', teams);
  const tournament = game.tournamentId ? tournaments.find((t) => t.id === game.tournamentId) : null;
  const showScore = game.status !== 'scheduled';

  return (
    <TouchableOpacity style={[styles.card, game.status === 'live' && styles.cardLive, style]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.top}>
        <Text style={styles.meta} numberOfLines={1}>
          {rules.emoji} {tournament ? `${tournament.name} · R${game.round}` : rules.name}
        </Text>
        {game.status === 'live' ? (
          <LiveDot small />
        ) : game.status === 'finished' ? (
          <Text style={styles.ft}>FINAL</Text>
        ) : (
          <View style={styles.row}>
            {game.remind ? <Bell color={colors.primary} size={12} /> : null}
            <Text style={styles.date}>{formatDateTime(game.date)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.side}>
          <TeamBadge uri={home?.logo || game.source?.homeBadge} name={getSideName(game, 'home', teams)} color={home?.color} size={44} />
          <Text style={[styles.name, result === 'away' && styles.loser]} numberOfLines={2}>
            {getSideName(game, 'home', teams)}
          </Text>
        </View>

        <View style={styles.center}>
          {showScore ? (
            <Text style={[styles.score, game.status === 'live' && { color: colors.live }]}>
              {score.home} : {score.away}
            </Text>
          ) : (
            <Text style={styles.vs}>VS</Text>
          )}
        </View>

        <View style={styles.side}>
          <TeamBadge uri={away?.logo || game.source?.awayBadge} name={getSideName(game, 'away', teams)} color={away?.color} size={44} />
          <Text style={[styles.name, result === 'home' && styles.loser]} numberOfLines={2}>
            {getSideName(game, 'away', teams)}
          </Text>
        </View>
      </View>

      {game.venue ? <Text style={styles.venue}>📍 {game.venue}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardLive: {
    borderColor: colors.live,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  ft: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  date: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
  },
  loser: {
    color: colors.textMuted,
  },
  center: {
    width: 90,
    alignItems: 'center',
  },
  score: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  vs: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: '900',
  },
  venue: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default GameCard;

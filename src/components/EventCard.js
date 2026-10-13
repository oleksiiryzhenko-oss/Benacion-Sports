import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import colors from '../utils/colors';
import { formatShortDate, formatTime } from '../utils/helpers';
import TeamBadge from './TeamBadge';
import LiveDot from './LiveDot';

// Compact API match row: badges, names, score or kick-off time
const EventCard = ({ event, onPress, showLeague = true, style }) => {
  const hasTeams = event.home && event.away;
  const showScore = (event.isFinished || event.isLive) && event.homeScore !== null;
  const homeWin = showScore && Number(event.homeScore) > Number(event.awayScore);
  const awayWin = showScore && Number(event.awayScore) > Number(event.homeScore);

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      {showLeague ? (
        <View style={styles.top}>
          <Text style={styles.league} numberOfLines={1}>
            {event.league}
            {event.round ? ` · R${event.round}` : ''}
          </Text>
          {event.isLive ? (
            <LiveDot small label={event.status || 'LIVE'} />
          ) : event.isCancelled ? (
            <Text style={styles.cancelled}>{event.status || 'Postponed'}</Text>
          ) : (
            <Text style={styles.date}>{formatShortDate(event.date)}</Text>
          )}
        </View>
      ) : null}

      {hasTeams ? (
        <View style={styles.body}>
          <View style={styles.teams}>
            <View style={styles.teamRow}>
              <TeamBadge uri={event.homeBadge} name={event.home} size={24} />
              <Text style={[styles.team, awayWin && styles.loser]} numberOfLines={1}>
                {event.home}
              </Text>
            </View>
            <View style={styles.teamRow}>
              <TeamBadge uri={event.awayBadge} name={event.away} size={24} />
              <Text style={[styles.team, homeWin && styles.loser]} numberOfLines={1}>
                {event.away}
              </Text>
            </View>
          </View>
          {showScore ? (
            <View style={styles.scoreCol}>
              <Text style={[styles.score, awayWin && styles.loser, event.isLive && styles.liveScore]}>{event.homeScore}</Text>
              <Text style={[styles.score, homeWin && styles.loser, event.isLive && styles.liveScore]}>{event.awayScore}</Text>
            </View>
          ) : (
            <View style={styles.timeBox}>
              <Text style={styles.time}>{formatTime(event.date)}</Text>
              {!showLeague ? <Text style={styles.timeDate}>{formatShortDate(event.date)}</Text> : null}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={[styles.team, { flex: 1 }]} numberOfLines={2}>
            {event.name}
          </Text>
          <View style={styles.timeBox}>
            <Text style={styles.time}>{formatTime(event.date)}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  league: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  cancelled: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teams: {
    flex: 1,
    gap: 8,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  team: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  loser: {
    color: colors.textMuted,
  },
  scoreCol: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 36,
  },
  score: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  liveScore: {
    color: colors.live,
  },
  timeBox: {
    backgroundColor: colors.surface2,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  time: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  timeDate: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

export default EventCard;

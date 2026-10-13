import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import colors from '../utils/colors';
import { eventHeadline, relativeTime, withAlpha } from '../utils/helpers';
import { sportEmoji } from '../data/sports';
import TeamBadge from './TeamBadge';
import LiveDot from './LiveDot';

// Big "news" card generated from an API event (results & previews)
const NewsCard = ({ event, onPress, compact = false, style }) => {
  const Wrapper = event.thumb ? ImageBackground : View;
  const wrapperProps = event.thumb ? { source: { uri: event.thumb }, imageStyle: styles.image } : {};

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={[compact ? styles.compact : styles.card, style]}>
      <Wrapper style={[styles.bg, compact && styles.bgCompact]} {...wrapperProps}>
        {!event.thumb ? (
          <View style={styles.badgesFallback}>
            <TeamBadge uri={event.homeBadge} name={event.home || event.name} size={compact ? 44 : 64} />
            {event.away ? <Text style={styles.vs}>VS</Text> : null}
            {event.away ? <TeamBadge uri={event.awayBadge} name={event.away} size={compact ? 44 : 64} /> : null}
          </View>
        ) : null}
        <LinearGradient colors={['transparent', withAlpha(colors.background, 0.7), colors.background]} style={styles.gradient}>
          <View style={styles.tagRow}>
            {event.isLive ? (
              <LiveDot small />
            ) : (
              <View style={[styles.tag, event.isFinished ? styles.tagResult : styles.tagPreview]}>
                <Text style={styles.tagText}>
                  {event.isFinished ? 'RESULT' : 'PREVIEW'}
                </Text>
              </View>
            )}
            <Text style={styles.meta} numberOfLines={1}>
              {sportEmoji(event.sport)} {event.league}
            </Text>
          </View>
          <Text style={[styles.headline, compact && styles.headlineCompact]} numberOfLines={compact ? 2 : 3}>
            {eventHeadline(event)}
          </Text>
          <Text style={styles.time}>{relativeTime(event.date)}</Text>
        </LinearGradient>
      </Wrapper>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  compact: {
    width: 270,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bg: {
    height: 220,
    justifyContent: 'flex-end',
    backgroundColor: colors.surface2,
  },
  bgCompact: {
    height: 170,
  },
  image: {
    resizeMode: 'cover',
  },
  badgesFallback: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 50,
  },
  vs: {
    color: colors.textMuted,
    fontWeight: '900',
    fontSize: 16,
  },
  gradient: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 40,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagResult: {
    backgroundColor: colors.text,
  },
  tagPreview: {
    backgroundColor: colors.primary,
  },
  tagText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  headline: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  headlineCompact: {
    fontSize: 15,
    lineHeight: 20,
  },
  time: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
});

export default NewsCard;

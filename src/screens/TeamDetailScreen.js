import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, Image, Linking, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Star, ExternalLink } from 'lucide-react-native';

import colors from '../utils/colors';
import { withAlpha } from '../utils/helpers';
import { getTeam, getTeamNextEvents, getTeamLastEvents, getTeamPlayers } from '../api/sportsApi';
import { sportEmoji } from '../data/sports';
import { useApp } from '../context/AppContext';
import ScreenHeader, { HeaderButton } from '../components/ScreenHeader';
import SectionHeader from '../components/SectionHeader';
import EventCard from '../components/EventCard';
import TeamBadge from '../components/TeamBadge';
import { LoadingView, ErrorView } from '../components/LoadingView';

const TeamDetailScreen = ({ navigation, route }) => {
  const { teamId, teamName } = route.params;
  const { isFavorite, toggleFavorite } = useApp();

  const [team, setTeam] = useState(null);
  const [next, setNext] = useState([]);
  const [last, setLast] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(false);
    (async () => {
      try {
        const info = await getTeam(teamId);
        if (!alive) return;
        setTeam(info);
        const [n, l, p] = await Promise.all([
          getTeamNextEvents(teamId).catch(() => []),
          getTeamLastEvents(teamId).catch(() => []),
          getTeamPlayers(teamId).catch(() => []),
        ]);
        if (!alive) return;
        setNext(n);
        setLast(l);
        setPlayers(p);
      } catch (e) {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [teamId, reloadKey]);

  const fav = isFavorite('teams', teamId);

  const onFavorite = () =>
    team &&
    toggleFavorite('teams', {
      id: team.id,
      name: team.name,
      badge: team.badge,
      sport: team.sport,
      league: team.league,
    });

  const openEvent = (e) => navigation.push('EventDetail', { event: e });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={team?.name || teamName}
        subtitle={team ? `${sportEmoji(team.sport)} ${team.league || team.sport}` : ''}
        onBack={() => navigation.goBack()}
        right={<HeaderButton icon={Star} active={fav} onPress={onFavorite} />}
      />

      {error ? (
        <ErrorView onRetry={() => setReloadKey((k) => k + 1)} />
      ) : !team ? (
        <LoadingView />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <ImageBackground
            source={team.fanart || team.banner ? { uri: team.fanart || team.banner } : undefined}
            style={styles.hero}
            imageStyle={{ borderRadius: 24 }}
          >
            <LinearGradient colors={[withAlpha(colors.background, 0.2), withAlpha(colors.background, 0.9)]} style={styles.heroOverlay}>
              <TeamBadge uri={team.badge} name={team.name} size={88} />
              <Text style={styles.name}>{team.name}</Text>
              {team.alternate ? (
                <Text style={styles.alt} numberOfLines={1}>
                  {team.alternate}
                </Text>
              ) : null}
            </LinearGradient>
          </ImageBackground>

          <View style={styles.facts}>
            {[
              ['Founded', team.formed],
              ['Country', team.country],
              ['Stadium', team.stadium],
              ['Capacity', team.stadiumCapacity ? Number(team.stadiumCapacity).toLocaleString() : null],
              ['Location', team.location],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <View key={k} style={styles.fact}>
                  <Text style={styles.factLabel}>{k}</Text>
                  <Text style={styles.factValue} numberOfLines={2}>
                    {v}
                  </Text>
                </View>
              ))}
          </View>

          {next.length ? (
            <>
              <SectionHeader title="Next match" />
              {next.map((e) => (
                <EventCard key={e.id} event={e} onPress={() => openEvent(e)} />
              ))}
            </>
          ) : null}

          {last.length ? (
            <>
              <SectionHeader title="Last result" />
              {last.map((e) => (
                <EventCard key={e.id} event={e} onPress={() => openEvent(e)} />
              ))}
            </>
          ) : null}

          {players.length ? (
            <>
              <SectionHeader title="Squad" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.players}>
                {players.map((p) => (
                  <View key={p.id} style={styles.player}>
                    {p.thumb ? (
                      <Image source={{ uri: p.thumb }} style={styles.playerImg} />
                    ) : (
                      <TeamBadge name={p.name} size={64} color={colors.info} />
                    )}
                    <Text style={styles.playerName} numberOfLines={2}>
                      {p.name}
                    </Text>
                    <Text style={styles.playerPos} numberOfLines={1}>
                      {p.number ? `#${p.number} · ` : ''}
                      {p.position || ''}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : null}

          {team.description ? (
            <>
              <SectionHeader title="About" />
              <TouchableOpacity activeOpacity={0.9} onPress={() => setExpanded((v) => !v)} style={styles.aboutCard}>
                <Text style={styles.about} numberOfLines={expanded ? undefined : 6}>
                  {team.description}
                </Text>
                <Text style={styles.more}>{expanded ? 'Show less' : 'Read more'}</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {team.website ? (
            <TouchableOpacity
              style={styles.website}
              onPress={() => Linking.openURL(team.website.startsWith('http') ? team.website : `https://${team.website}`)}
            >
              <ExternalLink color={colors.primary} size={16} />
              <Text style={styles.websiteText}>{team.website}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 60,
  },
  hero: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  heroOverlay: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  name: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 12,
    textAlign: 'center',
  },
  alt: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  fact: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  factLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  factValue: {
    color: colors.text,
    fontWeight: '700',
    marginTop: 4,
  },
  players: {
    paddingHorizontal: 16,
    gap: 10,
  },
  player: {
    width: 110,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface2,
  },
  playerName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  playerPos: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  aboutCard: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  about: {
    color: colors.textSecondary,
    lineHeight: 21,
  },
  more: {
    color: colors.primary,
    fontWeight: '700',
    marginTop: 8,
  },
  website: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 16,
  },
  websiteText: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default TeamDetailScreen;

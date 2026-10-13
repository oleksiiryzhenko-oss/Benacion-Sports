import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon, X, ChevronLeft } from 'lucide-react-native';

import colors from '../utils/colors';
import { searchTeams, searchEvents } from '../api/sportsApi';
import { sportEmoji } from '../data/sports';
import Segmented from '../components/Segmented';
import EventCard from '../components/EventCard';
import TeamBadge from '../components/TeamBadge';
import EmptyState from '../components/EmptyState';
import Chip from '../components/Chip';
import { LoadingView, ErrorView } from '../components/LoadingView';

const SUGGESTIONS = ['Arsenal', 'Real Madrid', 'Lakers', 'Barcelona', 'Bayern', 'Celtics', 'Juventus', 'Ferrari'];

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('teams');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  const run = async (q, m) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const list = m === 'teams' ? await searchTeams(q) : await searchEvents(q);
      setResults(list);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => run(query, mode), 450);
    return () => clearTimeout(debounceRef.current);
  }, [query, mode]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <ChevronLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <View style={styles.inputWrap}>
          <SearchIcon color={colors.textMuted} size={18} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder={mode === 'teams' ? 'Search teams…' : 'e.g. Arsenal vs Chelsea'}
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => run(query, mode)}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
              <X color={colors.textMuted} size={18} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Segmented
        options={[
          { value: 'teams', label: 'Teams' },
          { value: 'events', label: 'Matches' },
        ]}
        value={mode}
        onChange={setMode}
        style={{ marginBottom: 12 }}
      />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" onScrollBeginDrag={Keyboard.dismiss}>
        {!query ? (
          <View>
            <Text style={styles.hint}>Popular searches</Text>
            <View style={styles.suggestions}>
              {SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} onPress={() => setQuery(s)} />
              ))}
            </View>
          </View>
        ) : loading ? (
          <LoadingView text="Searching…" />
        ) : error ? (
          <ErrorView onRetry={() => run(query, mode)} />
        ) : searched && !results.length ? (
          <EmptyState emoji="🔍" title="Nothing found" text={mode === 'events' ? 'Use the format "Team A vs Team B".' : 'Try another team name.'} />
        ) : mode === 'teams' ? (
          results.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={styles.teamRow}
              onPress={() => navigation.navigate('TeamDetail', { teamId: t.id, teamName: t.name })}
            >
              <TeamBadge uri={t.badge} name={t.name} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.teamName}>{t.name}</Text>
                <Text style={styles.teamMeta}>
                  {sportEmoji(t.sport)} {t.league || t.sport}
                  {t.country ? ` · ${t.country}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          results.map((e) => <EventCard key={e.id} event={e} onPress={() => navigation.navigate('EventDetail', { event: e })} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  scroll: {
    paddingBottom: 60,
  },
  hint: {
    color: colors.textSecondary,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  teamName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  teamMeta: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});

export default SearchScreen;

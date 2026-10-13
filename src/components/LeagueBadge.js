import React, { useEffect, useState } from 'react';

import { getLeague } from '../api/sportsApi';
import TeamBadge from './TeamBadge';

// Lazily loads a league badge (cached for 24h by the API layer)
const LeagueBadge = ({ leagueId, name, size = 40, color }) => {
  const [uri, setUri] = useState(null);

  useEffect(() => {
    let alive = true;
    getLeague(leagueId)
      .then((l) => alive && setUri(l?.badge || null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [leagueId]);

  return <TeamBadge uri={uri} name={name} size={size} color={color} />;
};

export default LeagueBadge;

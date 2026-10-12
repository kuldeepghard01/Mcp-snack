import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { C, notify, Btn, Field, Chips, Sheet } from './ui';
import { rpc } from './api';
import { showRewardedAd } from './ads';
import { fmtCr, toCr, MAX_COLLECTION_CR } from './constants';

export default function JoinModal({ visible, movie, entry, onClose, onDone }) {
  const [val, setVal] = useState('');
  const [unit, setUnit] = useState('cr');
  const [ans, setAns] = useState([]);
  const [busy, setBusy] = useState(false);
  const qs = movie ? movie.about_questions || [] : [];

  useEffect(() => {
    if (!visible || !movie) return;
    setBusy(false);
    if (entry) {
      const p = Number(entry.prediction);
      if (p < 1) { setUnit('lakh'); setVal(String(Number((p * 100).toFixed(2)))); }
      else { setUnit('cr'); setVal(String(p)); }
      setAns((entry.answers || []).map((x) => !!x));
    } else {
      setVal('');
      setUnit('cr');
      setAns((movie.about_questions || []).map(() => null));
    }
  }, [visible, movie && movie.id, entry && entry.id]);

  if (!movie) return null;
  const cr = toCr(val, unit);
  const isEdit = !!entry;

  const setAnswer = (i, v) => {
    const next = ans.slice();
    next[i] = v;
    setAns(next);
  };

  const submit = async () => {
    if (isNaN(cr) || cr <= 0 || cr > MAX_COLLECTION_CR) { notify('Enter a valid Day 1 collection.'); return; }
    if (ans.length !== qs.length || ans.some((a) => a !== true && a !== false)) { notify('Please answer all the movie questions.'); return; }
    setBusy(true);
    try {
      if (isEdit) {
        await rpc('mcp_edit_entry', { p_entry: entry.id, p_prediction: cr, p_answers: ans });
        notify('Your entry was updated.');
      } else {
        const res = await showRewardedAd('Join ' + movie.title);
        if (res === 'dismissed') {
          notify('Please watch the full ad to join.');
          setBusy(false);
          return;
        }
        await rpc('mcp_join_contest', { p_movie: movie.id, p_prediction: cr, p_answers: ans });
        if (res === 'earned') rpc('mcp_log_ad', { p_placement: 'join' }).catch(() => {});
        notify('Success! You have joined. Find your entry in My Contests.');
      }
      onDone();
    } catch (e) {
      notify(e.message);
    }
    setBusy(false);
  };

  const pill = (label, active, color, onPress) => (
    <TouchableOpacity onPress={onPress} style={{ paddingHorizontal: 18, paddingVertical: 7, borderRadius: 16, backgroundColor: active ? color : '#2a2a2a', marginLeft: 8 }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Sheet visible={visible} title={isEdit ? 'Edit your entry' : 'Join contest'} onClose={onClose}>
      <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>{movie.title}</Text>
      <Text style={{ color: C.sub, fontSize: 11, marginBottom: 4 }}>Day 1 collection prediction</Text>
      <Chips options={[{ key: 'cr', label: 'Crore' }, { key: 'lakh', label: 'Lakh' }]} value={unit} onChange={setUnit} />
      <Field value={val} onChangeText={setVal} keyboardType="decimal-pad" placeholder={unit === 'cr' ? 'e.g. 85.68' : 'e.g. 50'} maxLength={10} />
      {!isNaN(cr) && cr > 0 ? <Text style={{ color: C.gold, fontSize: 11, marginBottom: 10 }}>{'Your prediction: ' + fmtCr(cr)}</Text> : null}

      <Text style={{ color: '#fff', fontSize: 13, fontWeight: 'bold', marginTop: 6, marginBottom: 6 }}>About the movie</Text>
      {qs.map((q, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, padding: 10, borderRadius: 8, marginBottom: 6 }}>
          <Text style={{ color: '#fff', fontSize: 12, flex: 1 }}>{q}</Text>
          {pill('Yes', ans[i] === true, '#1b5e20', () => setAnswer(i, true))}
          {pill('No', ans[i] === false, '#b71c1c', () => setAnswer(i, false))}
        </View>
      ))}

      <Btn title={busy ? 'Please wait...' : (isEdit ? 'Save changes' : 'Watch ad and join  ▶')} onPress={submit} disabled={busy} style={{ marginTop: 10 }} />
      <Text style={{ color: '#777', fontSize: 10, marginTop: 8 }}>
        Free to play. You can change your entry until entries close.
      </Text>
    </Sheet>
  );
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { Player } from '../types';

interface LobbyScreenProps {
  roomId: string | null;
  players: Player[];
  onStart: () => void;
}

export function LobbyScreen({ roomId, players, onStart }: LobbyScreenProps) {
  const serverUrl = `http://192.168.2.107:5173?room=${roomId}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 PartyStation</Text>
      <Text style={styles.subtitle}>Подключи телефон к вечеринке</Text>

      <View style={styles.content}>
        <View style={styles.qrSection}>
          {roomId ? (
            <QRCode
              value={serverUrl}
              size={200}
              bgColor="white"
              fgColor="#1A1A2E"
            />
          ) : (
            <View style={styles.qrPlaceholder} />
          )}
          <Text style={styles.roomCode}>{roomId || '---'}</Text>
          <Text style={styles.url}>{serverUrl}</Text>
        </View>

        <View style={styles.playersSection}>
          <Text style={styles.playersTitle}>
            Игроки ({players.length}/10)
          </Text>
          <View style={styles.playerList}>
            {players.length === 0 && (
              <Text style={styles.noPlayers}>Ожидаем игроков...</Text>
            )}
            {players.map((p, i) => (
              <View key={p.id} style={styles.playerItem}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {p.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.playerName}>{p.name}</Text>
                {i === 0 && <Text style={styles.hostBadge}>ХОСТ</Text>}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>
          {players.length === 0
            ? 'Сканируйте QR-код телефоном'
            : `Готовы начать? ${players.length} игрок(ов)`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 60,
  },
  content: {
    flexDirection: 'row',
    gap: 80,
    alignItems: 'flex-start',
  },
  qrSection: {
    alignItems: 'center',
    gap: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  roomCode: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: 12,
    color: '#6C63FF',
  },
  url: {
    fontSize: 14,
    color: '#666',
  },
  playersSection: {
    width: 400,
  },
  playersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#aaa',
    marginBottom: 16,
  },
  playerList: {
    gap: 12,
  },
  noPlayers: {
    fontSize: 18,
    color: '#444',
    textAlign: 'center',
    padding: 40,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'linear-gradient(135deg, #6C63FF, #FF6B6B)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  playerName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  hostBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
  },
  hint: {
    fontSize: 18,
    color: '#666',
  },
});

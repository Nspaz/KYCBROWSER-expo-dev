import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { FolderOpen, Search, X } from 'lucide-react-native';
import { styles } from './styles';

interface VideosHeaderProps {
  videoCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const VideosHeader = React.memo(function VideosHeader({
  videoCount,
  searchQuery,
  onSearchChange,
}: VideosHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerInfo}>
        <FolderOpen size={18} color="#00ff88" />
        <Text style={styles.headerTitle}>
          {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
          {searchQuery && ` found`}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={16} color="rgba(255,255,255,0.4)" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search videos..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          testID="videos-search-input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')} testID="videos-search-clear">
            <X size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

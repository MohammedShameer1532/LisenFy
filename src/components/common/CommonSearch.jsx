import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Ionicons from '@react-native-vector-icons/ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchcontext } from '../context/Searchcontext';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 400;
const MAX_CACHE_SIZE = 30;

const Commonsearch = () => {
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef(new Map());
  const { globalSearch, setDataSearch, setSongsuggest, setPlaylistDatas } = useContext(Searchcontext);

  const cancelActiveRequest = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);


  const fetchSearch = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setSearchResult(null);
      setLoading(false);
      return;
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    // Each fetch supersedes any earlier request.
    cancelActiveRequest();
    const currentRequestId = ++requestIdRef.current;

    if (cacheRef.current.has(normalizedQuery)) {
      const cachedResult = cacheRef.current.get(normalizedQuery);

      // Refresh its position in the bounded cache.
      cacheRef.current.delete(normalizedQuery);
      cacheRef.current.set(normalizedQuery, cachedResult);

      setSearchResult(cachedResult);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);

    try {
      const encodedQuery = encodeURIComponent(trimmedQuery);

      const [songRes, playlistRes] = await Promise.all([
        axios.get(
          `https://musify-api-inky.vercel.app/api/search?query=${encodedQuery}`,
          { signal: controller.signal }
        ),
        axios.get(
          `https://musify-api-inky.vercel.app/api/search/playlists?query=${encodedQuery}`,
          { signal: controller.signal }
        ),
      ]);

      if (
        controller.signal.aborted ||
        currentRequestId !== requestIdRef.current
      ) {
        return;
      }

      const result = {
        songs: songRes.data || [],
        playlists: playlistRes.data || [],
      };

      cacheRef.current.set(normalizedQuery, result);

      if (cacheRef.current.size > MAX_CACHE_SIZE) {
        const oldestKey = cacheRef.current.keys().next().value;
        if (oldestKey !== undefined) {
          cacheRef.current.delete(oldestKey);
        }
      }

      setSearchResult(result);
    } catch (error) {
      const wasCancelled =
        controller.signal.aborted ||
        error?.code === 'ERR_CANCELED' ||
        error?.name === 'CanceledError';

      if (!wasCancelled && currentRequestId === requestIdRef.current) {
        console.error('Search API error:', error);
        setSearchResult(null);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
      }
    }
  }, [cancelActiveRequest]);



  const debouncedSearch = useMemo(
    () => debounce(fetchSearch, DEBOUNCE_MS),
    [fetchSearch]
  );



  const handleSearchChange = useCallback((text) => {
    setSearch(text);

    // Invalidate an in-flight response immediately when the input changes.
    requestIdRef.current += 1;
    cancelActiveRequest();

    const trimmedText = text.trim();

    if (trimmedText.length < MIN_QUERY_LENGTH) {
      debouncedSearch.cancel();
      setSearchResult(null);
      setLoading(false);
      return;
    }

    // Avoid showing results for the previous query while this one is pending.
    setSearchResult(null);
    setLoading(true);
    debouncedSearch(text);
  }, [cancelActiveRequest, debouncedSearch]);



  const clearSearch = useCallback(() => {
    debouncedSearch.cancel();
    requestIdRef.current += 1;
    cancelActiveRequest();

    setSearch('');
    setSearchResult(null);
    setLoading(false);
  }, [cancelActiveRequest, debouncedSearch]);



  const handleSubmit = useCallback(() => {
    debouncedSearch.cancel();

    if (search.trim().length < MIN_QUERY_LENGTH) {
      setSearchResult(null);
      setLoading(false);
      return;
    }

    fetchSearch(search);
  }, [debouncedSearch, fetchSearch, search]);


  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
      requestIdRef.current += 1;
      cancelActiveRequest();
    };
  }, [cancelActiveRequest, debouncedSearch]);



  const allData = useMemo(() => {
    if (!searchResult) {
      return [];
    }

    const mergedResults = [
      ...(searchResult?.songs?.data?.topQuery?.results || []),
      ...(searchResult?.songs?.data?.songs?.results || []),
      ...(searchResult?.songs?.data?.albums?.results || []),
      ...(searchResult?.songs?.data?.artists?.results || []),
      ...(searchResult?.playlists?.data?.results || []),
    ];

    return Array.from(
      new Map(
        mergedResults.map((item, index) => [
          `${item?.type || 'item'}-${item?.id ?? index}`,
          item,
        ])
      ).values()
    );
  }, [searchResult]);



  const cleanTitle = useCallback((value) => {
    if (!value) return '';
    return value.replace(/\s*\(.*?\)\s*/g, '').trim();
  }, []);



  const renderItem = useCallback(({ item }) => {
    const screenName = {
      album: 'Album',
      song: 'Song',
      artist: 'Artist',
      playlist: 'Playlist',
    }[item?.type] || 'Song';

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => {
          navigation.navigate(screenName);
          setDataSearch(item.id);
          setPlaylistDatas(item.id);
        }}
      >
        <View style={styles.songContainer}>
          <Image
            source={
              item?.image?.[2]?.url
                ? { uri: item.image[2].url }
                : require('../../assets/images/musicphoto.jpg')
            }
            style={styles.songImage}
          />

          <View style={styles.textContainer}>
            <Text style={styles.songTitle} numberOfLines={2}>
              {cleanTitle(item?.title || item?.name)}
            </Text>

            {item?.year ? (
              <Text style={styles.metaText}>({item.year})</Text>
            ) : null}

            {item?.album ? (
              <Text style={styles.metaText} numberOfLines={1}>
                {cleanTitle(item.album)}
              </Text>
            ) : null}

            {item?.singers ? (
              <Text style={styles.metaText} numberOfLines={2}>
                {cleanTitle(item.singers)}
              </Text>
            ) : null}
          </View>

          <Ionicons name="chevron-forward" size={18} color="#777" />
        </View>
      </TouchableOpacity >
    );
  }, [cleanTitle, navigation]);


  const queryIsTooShort = search.trim().length < MIN_QUERY_LENGTH;

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="gray" />

          <TextInput
            style={styles.input}
            placeholder="Search songs, albums, artists..."
            placeholderTextColor="gray"
            value={search}
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="search"
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSubmit}
          />

          {loading ? (
            <ActivityIndicator size="small" color="#1DB954" />
          ) : search.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={allData}
        keyExtractor={(item, index) =>
          `${item?.type || 'item'}-${item?.id ?? index}`
        }
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          queryIsTooShort ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={45} color="#555" />
              <Text style={styles.emptyTitle}>Search LisenFy</Text>
              <Text style={styles.emptySubtitle}>
                Find your favourite songs, albums, artists and playlists.
              </Text>
            </View>
          ) : !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={45} color="#555" />
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching with another keyword.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default Commonsearch;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    marginHorizontal: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 48,
  },
  input: {
    fontFamily: 'DMSans-Medium',
    flex: 1,
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    paddingVertical: 0,
  },
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#222',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  songTitle: {
    fontSize: 15,
    color: 'white',
    fontFamily: 'DMSans-Bold',
  },
  metaText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
    fontFamily: 'DMSans-Regular',
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 15,
    backgroundColor: '#252525',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  listContent: {
    paddingBottom: 30,
    marginTop: 10,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 100,
  },
  emptyTitle: {
    color: 'white',
    fontFamily: 'DMSans-Bold',
    fontSize: 17,
    marginTop: 15,
  },
  emptySubtitle: {
    color: '#888',
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },
});
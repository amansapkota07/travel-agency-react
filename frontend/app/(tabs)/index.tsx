import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';

const API_BASE_URL = "http://192.168.18.40:5000/api/travel";

interface Country {
  name: string;
  cca2: string; 
}

const getFlagEmoji = (cca2: string): string => {
  if (!cca2 || cca2.length !== 2) return '';
  const codePoints = cca2
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
  return String.fromCodePoint(...codePoints);
};

export default function Home() {
  const router = useRouter();

  const [residence, setResidence] = useState('');
  const [destination, setDestination] = useState('');
  const [nationality, setNationality] = useState('');

  const [searchResidence, setSearchResidence] = useState('');
  const [searchDestination, setSearchDestination] = useState('');
  const [searchNationality, setSearchNationality] = useState('');

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const avatars = [
    { icon: 'home', name: "Country Of Residence", placeholder: "Select residence", bgColor: '#6200EE' },
    { icon: 'airplane', name: 'Travel Destination', placeholder: "Select destination", bgColor: '#6200EE' },
    { icon: 'globe', name: 'Country Of Nationality', placeholder: "Select nationality", bgColor: '#6200EE' }
  ];

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/countries`);
      const sorted = (res.data.countries || [])
        .filter(c => c.name && c.cca2)
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountries(sorted);
      setLoading(false);
    } catch (err) {
      Alert.alert("Error", "Cannot connect to server.");
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!residence || !destination || !nationality) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/submit`, {
        countryOfResidence: residence,
        travelDestination: destination,
        nationality
      });

      router.push({
        pathname: '/travel-details',
        params: { residence, destination, nationality }
      });
    } catch (err: any) {
      Alert.alert("Failed", err.response?.data?.message || "Network error");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200EE" />
        <Text style={{ marginTop: 20, fontSize: 16 }}>Please wait...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <Ionicons name="menu" size={28} color="white" />
        <Text style={styles.title}>Travel Information</Text>
        <Ionicons name="information-circle" size={28} color="white" />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.paragraph}>
          Please select the relevant countries for your travel information
        </Text>

        {avatars.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={28} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.cardText}>{item.name}</Text>

              {index === 0 ? (
                <>
                  <TextInput
                    placeholder={item.placeholder}
                    value={residence}
                    onChangeText={(text) => {
                      setResidence(text);
                      setSearchResidence(text);
                    }}
                    style={styles.input}
                  />

                  {searchResidence.length > 0 && (
                    <ScrollView style={styles.suggestionBox}>
                      {countries
                        .filter(c => c.name.toLowerCase().includes(searchResidence.toLowerCase()))
                        .map(c => (
                          <TouchableOpacity
                            key={c.name}
                            onPress={() => {
                              setResidence(c.name);
                              setSearchResidence('');
                            }}
                            style={styles.suggestionItem}
                          >
                            <Text>{getFlagEmoji(c.cca2)} {c.name}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  )}
                </>
              ) : index === 1 ? (
                <>
                  <TextInput
                    placeholder={item.placeholder}
                    value={destination}
                    onChangeText={(text) => {
                      setDestination(text);
                      setSearchDestination(text);
                    }}
                    style={styles.input}
                  />

                  {searchDestination.length > 0 && (
                    <ScrollView style={styles.suggestionBox}>
                      {countries
                        .filter(c => c.name.toLowerCase().includes(searchDestination.toLowerCase()))
                        .map(c => (
                          <TouchableOpacity
                            key={c.name}
                            onPress={() => {
                              setDestination(c.name);
                              setSearchDestination('');
                            }}
                            style={styles.suggestionItem}
                          >
                            <Text>{getFlagEmoji(c.cca2)} {c.name}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  )}
                </>
              ) : (
                <>
                  <TextInput
                    placeholder={item.placeholder}
                    value={nationality}
                    onChangeText={(text) => {
                      setNationality(text);
                      setSearchNationality(text);
                    }}
                    style={styles.input}
                  />

                  {searchNationality.length > 0 && (
                    <ScrollView style={styles.suggestionBox}>
                      {countries
                        .filter(c => c.name.toLowerCase().includes(searchNationality.toLowerCase()))
                        .map(c => (
                          <TouchableOpacity
                            key={c.name}
                            onPress={() => {
                              setNationality(c.name);
                              setSearchNationality('');
                            }}
                            style={styles.suggestionItem}
                          >
                            <Text>{getFlagEmoji(c.cca2)} {c.name}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  )}
                </>
              )}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.BtnTxt}>Show Travel Details</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Make sure all fields are filled up properly before proceeding
        </Text>

        <View style={styles.footerLinks}>
          <Ionicons name="chatbubble-outline" size={24} color="#6200EE" />
          <Text style={styles.linkText}>Chat With Us</Text>
          <Text style={{ marginHorizontal: 20, fontSize: 30, color: '#6200EE' }}>|</Text>
          <Ionicons name="help-circle-outline" size={24} color="#6200EE" />
          <Text style={styles.linkText}>FAQs</Text>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  appBar: {
    height: Platform.OS === 'ios' ? 110 : 100,
    backgroundColor: '#6200EE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  body: { padding: 22 },
  paragraph: { fontSize: 16, color: '#444', margin: 10, marginBottom: 24, marginTop: 5, lineHeight: 22 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
  },
  cardText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#ddd'
  },
  suggestionBox: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  button: {
    backgroundColor: '#66F917',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    elevation: 6,
  },
  BtnTxt: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  footerText: { marginTop: 20, fontSize: 14, color: '#666', textAlign: 'center' },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  linkText: { fontSize: 16, color: '#6200EE', marginHorizontal: 10, fontWeight: '600' },
});

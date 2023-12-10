import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import * as Progress from 'react-native-progress';
import auth from '@react-native-firebase/auth'
import { useSelector } from 'react-redux';
import Video from 'react-native-video'

const Gallery = () => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [uploadProgress, setuploadProgress] = useState(0);
  const [isLoading, setisLoading] = useState(false);
  const themeMode = useSelector(state => state.theme.mode);


  const handleGallery = async () => {
    try {
      const result = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        mediaType: 'any',
      })
      if (result) {
        setSelectedMedia(result)
      }
    } catch (error) {
      console.log(error);
    }

  };

  const upload = async (path, type) => {
    try {
      setisLoading(true);
      const user = auth().currentUser;
      const reference = storage().ref(`${user.uid}/Posts/${new Date().getTime()}.jpg`)

      const task = reference.putFile(path);
      task.on('state_changed', snapshot => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setuploadProgress(progress);
      });

      task.then(async () => {
        setisLoading(false);
        const url = await reference.getDownloadURL();
        console.log(url);
      });
    } catch (error) {
      setisLoading(false);
      console.log(error);
    }
  };

  const handleUpload = () => {
    if (selectedMedia) {
      const mediaType = selectedMedia.mime.startsWith('image')
        ? 'images'
        : 'videos';
      const path = selectedMedia.path || selectedMedia.sourceURL;

      upload(path, mediaType);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#EC8B5E' }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 35,
          marginTop: 25,
        }}>
        <TouchableOpacity
          onPress={handleGallery}
          style={{
            borderWidth: 1,
            borderRadius: 35,
            width: 130,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#141A46',
          }}>
          <Text style={{ fontSize: 20, fontWeight: '500', color: 'white' }}>
            Select Media
          </Text>
        </TouchableOpacity>
      </View>
      {selectedMedia && selectedMedia.mime.startsWith('image') ? (
        <Image
          source={{ uri: selectedMedia.path || selectedMedia.sourceURL }}
          style={{ width: 360, height: 360, resizeMode: 'cover' }}
        />
      ) : null}

      {selectedMedia && selectedMedia.mime.startsWith('video') ? (
        <Video
          source={{ uri: selectedMedia.path || selectedMedia.sourceURL }}
          style={{ width: 360, height: 360 }}
          controls
        />
      ) : null}

      {isLoading && (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Progress.Bar progress={uploadProgress} width={200} />
        </View>
      )}
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 35,
          marginTop: 25,
        }}>
        <TouchableOpacity
          onPress={handleUpload}
          style={{
            borderWidth: 1,
            borderRadius: 35,
            width: 130,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#141A46',
          }}>
          <Text style={{ fontSize: 20, fontWeight: '500', color: 'white' }}>
            Upload
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Gallery;

const styles = StyleSheet.create({
  mainwrapper: {
    flex: 1,
  },
  imgcont: {
    width: '100%',
    height: 350,
  },
  btn: {
    padding: 10,
    borderRadius: 30,
    width: 150,
    marginVertical: 30,
    elevation: 7,
    alignSelf: 'center',
  },
  btntxt: {
    textAlign: 'center',
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
  },
  progwrap: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progtitle: {
    color: '#343148FF',
    fontFamily: 'Nunito-Medium',
    fontSize: 18,
  },
});

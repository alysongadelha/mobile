import { useState } from "react";
import { ScrollView, Switch, Text, TextInput, View, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import Icon from "@expo/vector-icons/Feather";
import NLWLogo from "../src/assets/nlw-spacetime-logo.svg";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { api } from "../src/lib/api";

interface Preview {
  uri: string;
  type: PreviewType;
}

enum PreviewType {
  IMAGE = "image",
  VIDEO = "video",
}

const NewMemory = () => {
  const { bottom, top } = useSafeAreaInsets();
  const router = useRouter();

  const [isPublic, setIsPublic] = useState(false);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);

  const openImagePicker = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        selectionLimit: 1,
      });
      const imageUri = {
        uri: result.assets[0].uri,
        type: result.assets[0].type,
      } as Preview;

      if (imageUri) {
        setPreview(imageUri);
      }
    } catch (error) {
      // TO DO
      console.error(error);
    }
  };

  const handleCreateMemory = async () => {
    const token = await SecureStore.getItemAsync("token");

    let coverUrl = "";

    if (preview) {
      const uploadFormData = new FormData();

      uploadFormData.append("file", {
        uri: preview.uri,
        name: `mobile_upload.${
          preview.type === PreviewType.IMAGE ? "jpg" : "mp4"
        }`,
        type: preview.type,
      } as any);

      const uploadResponser = await api.post("/upload", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      coverUrl = uploadResponser.data.fileUrl;

      const sendNewMemory = await api.post(
        "/memories",
        {
          content,
          isPublic,
          coverUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (sendNewMemory.status === 200) return router.push("/memories");

      if (sendNewMemory.status === 400) console.error(sendNewMemory.statusText);
    }
  };

  const handleRenderCase = (): JSX.Element => {
    switch (preview?.type) {
      case PreviewType.IMAGE:
        return (
          <Image
            source={{ uri: preview.uri }}
            className="h-full w-full rounded-lg object-cover"
          />
        );
      case PreviewType.VIDEO:
        // TODO
        return null;
      default:
        return (
          <View className="flex-row items-center gap-2">
            <Icon name="image" color="#FFF" />
            <Text className="font-body text-sm text-gray-200">
              Add photo, video or story
            </Text>
          </View>
        );
    }
  };

  return (
    <ScrollView
      className="flex-1 px-8"
      contentContainerStyle={{ paddingBottom: bottom, paddingTop: top }}
    >
      <View className="mt-4 flex-row items-center justify-between">
        <NLWLogo />

        <Link href="/memories" asChild>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-purple-500">
            <Icon name="arrow-left" size={16} color="#FFF" />
          </TouchableOpacity>
        </Link>
      </View>
      <View className="mt-6 space-y-6">
        <View className="item-center flex-row gap-2">
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{
              false: "#767577",
              true: "#372560",
            }}
            thumbColor={isPublic ? "#9b79ea" : "#9e9ea0"}
          />
          <Text className="font-body text-base text-gray-200">
            Make public memory
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={openImagePicker}
          className="h-32 items-center justify-center rounded-lg border border-dashed border-gray-500 bg-black/20"
        >
          {handleRenderCase()}
        </TouchableOpacity>
        <TextInput
          multiline
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
          className="p-0 font-body text-lg text-gray-50"
          placeholderTextColor="#56565a"
          placeholder="Feel free to add photos, videos and stories about experiences you want to remember"
        />

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCreateMemory}
          className="items-center rounded-full bg-green-500 px-5 py-3"
        >
          <Text className="font-alt text-sm uppercase text-black">Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default NewMemory;

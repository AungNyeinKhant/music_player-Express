import prisma from "../prisma";
import { TrackDto } from "../types/track.dto";

class TrackService {
  public async createTrack(createTrackData: TrackDto) {
    const { name, description, audio, artist_id, album_id, genre_id } =
      createTrackData;

    const newTrack = await prisma.track.create({
      data: {
        name,
        description,
        audio: audio?.filename,
        artist_id,
        album_id,
        genre_id,
      },
    });

    return newTrack;
  }
}
const trackService = new TrackService();
export default trackService;

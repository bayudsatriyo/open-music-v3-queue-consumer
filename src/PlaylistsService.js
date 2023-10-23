const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(userId, playlistId) {
    console.log(playlistId);
    const query = {
      text: `SELECT playlist.id AS id, playlist.name AS name, users.username AS username, json_agg(json_build_object('id', songs.id, 'title', songs.title, 'performer', songs.performer)) AS songs
      FROM playlist
      JOIN playlist_song ON playlist.id = playlist_song.playlist_id
      JOIN users ON playlist.owner = users.id
      JOIN songs ON playlist_song.song_id = songs.id
      WHERE playlist.id = $1
      GROUP BY playlist.id, users.id;`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    const finalresult = result.rows[0];
    console.log(finalresult);
    if (!result.rows.length) {
      // bila album tidak memiliki songs
      const query2 = {
        text: `SELECT playlist.id AS id, playlist.name AS name, users.username AS username
        FROM playlist
        JOIN users ON playlist.owner = users.id
        WHERE playlist.id = $1
        GROUP BY playlist.id, users.id;`,
        values: [playlistId],
      };
      const result2 = await this._pool.query(query2);
      console.log(result2.rows);
      if (!result2.rows.length) {
        throw new Error('playlist tidak ditemukan');
      }
      return result2.rows[0];
    }
    return finalresult;
  }
}

module.exports = PlaylistsService;

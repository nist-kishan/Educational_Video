import { supabaseAdmin } from '../config/supabase.js';

// ==================== BOOKMARKS ====================

// Create bookmark
export const createBookmark = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { timestamp, title } = req.body;
    const studentId = req.user.id;

    console.log('🔖 Creating bookmark:', { videoId, timestamp, studentId });

    // Check if video exists
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Create bookmark
    const { data: bookmark, error: bookmarkError } = await supabaseAdmin
      .from('bookmarks')
      .insert({
        video_id: videoId,
        student_id: studentId,
        timestamp: timestamp || 0,
        title: title || `Bookmark at ${timestamp}s`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (bookmarkError) throw bookmarkError;

    console.log('✅ Bookmark created:', bookmark);

    res.status(201).json({
      success: true,
      message: 'Bookmark created successfully',
      bookmark
    });
  } catch (error) {
    console.error('❌ Create bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bookmark',
      error: error.message
    });
  }
};

// Get video bookmarks
export const getVideoBookmarks = async (req, res) => {
  try {
    const { videoId } = req.params;
    const studentId = req.user.id;

    console.log('🔖 Fetching bookmarks:', { videoId, studentId });

    const { data: bookmarks, error: bookmarkError } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('video_id', videoId)
      .eq('student_id', studentId)
      .order('timestamp', { ascending: true });

    if (bookmarkError) throw bookmarkError;

    console.log('✅ Bookmarks fetched:', bookmarks?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Bookmarks fetched successfully',
      bookmarks: bookmarks || []
    });
  } catch (error) {
    console.error('❌ Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error.message
    });
  }
};

// Delete bookmark
export const deleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.params;
    const studentId = req.user.id;

    console.log('🗑️ Deleting bookmark:', { bookmarkId, studentId });

    // Verify ownership
    const { data: bookmark, error: bookmarkError } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('id', bookmarkId)
      .eq('student_id', studentId)
      .single();

    if (bookmarkError || !bookmark) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own bookmarks'
      });
    }

    // Delete
    const { error: deleteError } = await supabaseAdmin
      .from('bookmarks')
      .delete()
      .eq('id', bookmarkId);

    if (deleteError) throw deleteError;

    console.log('✅ Bookmark deleted');

    res.status(200).json({
      success: true,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bookmark',
      error: error.message
    });
  }
};

// ==================== NOTES ====================

// Create note
export const createNote = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content, timestamp } = req.body;
    const studentId = req.user.id;

    console.log('📝 Creating note:', { videoId, timestamp, studentId });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty'
      });
    }

    // Check if video exists
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (videoError || !video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Create note
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .insert({
        video_id: videoId,
        student_id: studentId,
        content: content.trim(),
        timestamp: timestamp || 0,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (noteError) throw noteError;

    console.log('✅ Note created:', note);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('❌ Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message
    });
  }
};

// Get video notes
export const getVideoNotes = async (req, res) => {
  try {
    const { videoId } = req.params;
    const studentId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    console.log('📝 Fetching notes:', { videoId, studentId });

    const { data: notes, error: noteError, count } = await supabaseAdmin
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('video_id', videoId)
      .eq('student_id', studentId)
      .order('timestamp', { ascending: true })
      .range(offset, offset + limit - 1);

    if (noteError) throw noteError;

    console.log('✅ Notes fetched:', notes?.length || 0);

    res.status(200).json({
      success: true,
      message: 'Notes fetched successfully',
      notes: notes || [],
      pagination: {
        total: count || 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes',
      error: error.message
    });
  }
};

// Update note
export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;

    console.log('✏️ Updating note:', { noteId, studentId });

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content cannot be empty'
      });
    }

    // Verify ownership
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('student_id', studentId)
      .single();

    if (noteError || !note) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own notes'
      });
    }

    // Update
    const { data: updatedNote, error: updateError } = await supabaseAdmin
      .from('notes')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log('✅ Note updated');

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note: updatedNote
    });
  } catch (error) {
    console.error('❌ Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note',
      error: error.message
    });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const studentId = req.user.id;

    console.log('🗑️ Deleting note:', { noteId, studentId });

    // Verify ownership
    const { data: note, error: noteError } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('student_id', studentId)
      .single();

    if (noteError || !note) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own notes'
      });
    }

    // Delete
    const { error: deleteError } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) throw deleteError;

    console.log('✅ Note deleted');

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note',
      error: error.message
    });
  }
};

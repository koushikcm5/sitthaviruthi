import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Modal, KeyboardAvoidingView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { contentAPI } from '../../services/api';

export default function AdminContentManager({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || 'videos');
  const [videos, setVideos] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [manifestationVideo, setManifestationVideo] = useState(null);
  const [videoExists, setVideoExists] = useState(false);

  // Video form
  const [videoForm, setVideoForm] = useState({ title: '', url: '', level: '1', description: '', part: null });

  // Routine form
  const [routineForm, setRoutineForm] = useState({ name: '', description: '', sequence: '1' });

  // Habit form
  const [habits, setHabits] = useState([]);
  const [habitForms, setHabitForms] = useState([]);

  // Workshop form
  const [workshopForm, setWorkshopForm] = useState({ title: '', description: '', level: '1', startTime: '', endTime: '', link: '', type: 'upcoming' });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // Manifestation video form
  const [manifestationForm, setManifestationForm] = useState({ name: 'Manifestation', url: '' });

  // Success/Error modals
  const [successModal, setSuccessModal] = useState(null);
  const [errorModal, setErrorModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [levelModalType, setLevelModalType] = useState('video');
  const [showPartModal, setShowPartModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'videos') loadVideos();
    if (activeTab === 'manifestation') loadManifestationVideo();
    if (activeTab === 'habits') loadHabits();
  }, [activeTab]);

  const loadVideos = async () => {
    try {
      const data = await contentAPI.getVideos();
      setVideos(data);
    } catch (error) {
      console.log('Error loading videos:', error);
      setVideos([]);
    }
  };

  const loadManifestationVideo = async () => {
    try {
      const data = await contentAPI.getManifestationVideo();
      if (data) {
        setManifestationVideo(data);
        setManifestationForm({ name: data.name, url: data.url });
        setVideoExists(true);
      } else {
        setVideoExists(false);
      }
    } catch (error) {
      setVideoExists(false);
    }
  };

  const addOrUpdateVideo = async () => {
    if (!videoForm.title || !videoForm.url) {
      setErrorModal('Please fill in title and URL');
      return;
    }
    try {
      const data = await contentAPI.addVideo({
        ...videoForm,
        level: parseInt(videoForm.level),
        part: videoForm.part ? parseInt(videoForm.part) : null
      });
      setSuccessModal(data.message || 'Video saved successfully!');
      setVideoForm({ title: '', url: '', level: '1', description: '', part: null });
      loadVideos();
    } catch (error) {
      setErrorModal(error.message || 'Failed to save video');
    }
  };

  const getVideoForLevel = (level) => {
    const levelVideos = videos.filter(v => v.level === level);
    return levelVideos.length > 0 ? levelVideos[0] : null;
  };

  const addRoutine = async () => {
    try {
      await contentAPI.addRoutine({
        ...routineForm,
        sequence: parseInt(routineForm.sequence),
        active: true
      });
      setSuccessModal('Routine added successfully!');
      setRoutineForm({ name: '', description: '', sequence: '1' });
    } catch (error) {
      setErrorModal(error.message || 'Failed to add routine');
    }
  };

  const loadHabits = async () => {
    try {
      const data = await contentAPI.getHabits();
      setHabits(data);
      setHabitForms(data.map(h => ({ id: h.id, name: h.name, description: h.description })));
    } catch (error) {
      console.log('Error loading habits:', error);
      setHabits([]);
      setHabitForms([]);
    }
  };

  const updateHabitField = (index, field, value) => {
    setHabitForms(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addNewHabit = async () => {
    try {
      await contentAPI.addHabit({ name: 'New Task', description: 'Task description', active: true });
      setSuccessModal('New task added successfully!');
      await loadHabits();
    } catch (error) {
      setErrorModal(error.message || 'Failed to add task');
    }
  };

  const deleteHabit = async (habitId) => {
    setDeleteModal(habitId);
  };

  const confirmDeleteHabit = async () => {
    try {
      await contentAPI.deleteHabit(deleteModal);
      setDeleteModal(null);
      setSuccessModal('Task deleted successfully!');
      loadHabits();
    } catch (error) {
      setDeleteModal(null);
      setErrorModal(error.message || 'Failed to delete task');
    }
  };

  const updateAllHabits = async () => {
    try {
      for (const habit of habitForms) {
        await contentAPI.updateHabit(habit.id, { name: habit.name, description: habit.description, active: true });
      }
      setSuccessModal('All tasks updated successfully!');
      loadHabits();
    } catch (error) {
      setErrorModal(error.message || 'Failed to update tasks');
    }
  };

  const addWorkshop = async () => {
    if (!workshopForm.title || !workshopForm.description || !workshopForm.link) {
      setErrorModal('Please fill all fields');
      return;
    }
    if (!workshopForm.startTime || !workshopForm.endTime) {
      setErrorModal('Please select start and end time');
      return;
    }

    try {
      await contentAPI.addWorkshop({
        ...workshopForm,
        level: parseInt(workshopForm.level),
        active: true
      });
      setSuccessModal('Workshop added successfully!');
      setWorkshopForm({ title: '', description: '', level: '1', startTime: '', endTime: '', link: '', type: 'upcoming' });
      setStartDate(new Date());
      setEndDate(new Date());
    } catch (error) {
      setErrorModal(error.message || 'Failed to add workshop');
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(startDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartDate(newDate);
      const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}T${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}:00`;
      setWorkshopForm(prev => ({ ...prev, startTime: formatted }));
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      newDate.setSeconds(0);
      setStartDate(newDate);
      const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}T${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}:00`;
      setWorkshopForm(prev => ({ ...prev, startTime: formatted }));
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const newDate = new Date(endDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setEndDate(newDate);
      const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}T${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}:00`;
      setWorkshopForm(prev => ({ ...prev, endTime: formatted }));
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      newDate.setSeconds(0);
      setEndDate(newDate);
      const formatted = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}T${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}:00`;
      setWorkshopForm(prev => ({ ...prev, endTime: formatted }));
    }
  };

  const addOrUpdateManifestationVideo = async () => {
    try {
      const data = await contentAPI.addOrUpdateManifestationVideo(manifestationForm);
      setSuccessModal(data.message || 'Manifestation video updated successfully!');
      loadManifestationVideo();
    } catch (error) {
      setErrorModal(error.message || 'Failed to update manifestation video');
    }
  };

  const renderVideoTab = () => {
    const existingVideo = getVideoForLevel(parseInt(videoForm.level));
    return (
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>{existingVideo ? 'Update' : 'Add'} Video for Level {videoForm.level}</Text>
        <Text style={styles.infoText}>One video per level. {existingVideo ? 'Update existing video below.' : 'Add a new video.'}</Text>

        <Text style={styles.fieldLabel}>Select Level:</Text>
        <TouchableOpacity
          style={styles.levelSelectBtn}
          onPress={() => {
            setLevelModalType('video');
            setShowLevelModal(true);
          }}
        >
          <MaterialIcons name="layers" size={18} color="#063159" />
          <Text style={styles.levelSelectText}>
            {videoForm.level === '1' ? 'Level 1 - NarKarma Viruthi' :
              videoForm.level === '2' ? 'Level 2 - Suya Viruthi' :
                'Level 3 - Yoga Viruthi'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#063159" />
        </TouchableOpacity>

        {videoForm.level === '3' && (
          <>
            <Text style={styles.fieldLabel}>Select Part (for Yoga Viruthi):</Text>
            <TouchableOpacity
              style={styles.levelSelectBtn}
              onPress={() => setShowPartModal(true)}
            >
              <MaterialIcons name="filter-1" size={18} color="#063159" />
              <Text style={styles.levelSelectText}>
                {videoForm.part ? `Part ${videoForm.part}` : 'Select Part'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color="#063159" />
            </TouchableOpacity>
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Video Title"
          placeholderTextColor="#8E8E93"
          value={videoForm.title}
          onChangeText={(text) => setVideoForm({ ...videoForm, title: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Video Url..."
          placeholderTextColor="#8E8E93"
          value={videoForm.url}
          onChangeText={(text) => setVideoForm({ ...videoForm, url: text })}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#8E8E93"
          multiline
          value={videoForm.description}
          onChangeText={(text) => setVideoForm({ ...videoForm, description: text })}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addOrUpdateVideo}>
          <Text style={styles.btnText}>{existingVideo ? 'Update Video' : 'Add Video'}</Text>
        </TouchableOpacity>

        {existingVideo && (
          <View style={styles.currentVideoCard}>
            <Text style={styles.currentVideoTitle}>Current Video for Level {videoForm.level}</Text>
            <Text style={styles.currentVideoName}>{existingVideo.title}</Text>
            <Text style={styles.currentVideoUrl}>{existingVideo.url}</Text>
            <Text style={styles.videoCardDesc}>{existingVideo.description}</Text>
            {existingVideo.part && <Text style={{ fontSize: 11, color: '#401604ff', fontFamily: 'WorkSans-Bold', marginTop: 4 }}>Part {existingVideo.part}</Text>}
          </View>
        )}

        <View style={styles.divider} />

        <Text style={styles.formTitle}>All Videos</Text>
        {[1, 2, 3].map(level => {
          const video = getVideoForLevel(level);
          return (
            <View key={level} style={styles.videoCard}>
              <Text style={styles.levelBadgeInCard}>Level {level}</Text>
              {video ? (
                <>
                  <Text style={styles.videoCardTitle}>{video.title}</Text>
                  <Text style={styles.videoCardDesc}>{video.description}</Text>
                  <Text style={styles.videoCardUrl}>{video.url}</Text>
                  {video.part && <Text style={{ fontSize: 11, color: '#531f08ff', fontFamily: 'WorkSans-Bold', marginTop: 4 }}>Part {video.part}</Text>}
                </>
              ) : (
                <Text style={styles.noVideos}>No video added yet</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderRoutineTab = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Add Daily Routine Step</Text>

      <TextInput
        style={styles.input}
        placeholder="Routine Name (e.g., Manifestation)"
        placeholderTextColor="#8E8E93"
        value={routineForm.name}
        onChangeText={(text) => setRoutineForm({ ...routineForm, name: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#8E8E93"
        multiline
        value={routineForm.description}
        onChangeText={(text) => setRoutineForm({ ...routineForm, description: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Sequence (order)"
        placeholderTextColor="#8E8E93"
        keyboardType="numeric"
        value={routineForm.sequence}
        onChangeText={(text) => setRoutineForm({ ...routineForm, sequence: text })}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addRoutine}>
        <Text style={styles.btnText}>Add Routine</Text>
      </TouchableOpacity>
    </View>
  );

  const createDefaultTasks = async () => {
    try {
      const data = await contentAPI.fixHabits();
      setSuccessModal(data.message || 'Default tasks created successfully!');
      loadHabits();
    } catch (error) {
      setErrorModal(error.message || 'Failed to create default tasks');
    }
  };

  const renderHabitTab = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Daily Habit Tasks</Text>
      <Text style={styles.infoText}>Add, edit, or delete tasks. Save changes when done.</Text>

      {(!Array.isArray(habits) || habits.length === 0) && (
        <View style={styles.noTasksContainer}>
          <Text style={styles.noTasksText}>No tasks found. Create default tasks or add new ones.</Text>
          <TouchableOpacity style={styles.addBtn} onPress={createDefaultTasks}>
            <Text style={styles.btnText}>+ Create 5 Default Tasks</Text>
          </TouchableOpacity>
        </View>
      )}

      {habitForms.map((habit, index) => (
        <View key={habit.id} style={styles.simpleTaskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskLabel}>Task {index + 1}</Text>
            <TouchableOpacity
              style={styles.deleteTaskBtn}
              onPress={() => deleteHabit(habit.id)}>
              <Text style={styles.deleteTaskText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            placeholderTextColor="#8E8E93"
            value={habit.name}
            onChangeText={(text) => updateHabitField(index, 'name', text)}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Task Description"
            placeholderTextColor="#8E8E93"
            multiline
            value={habit.description}
            onChangeText={(text) => updateHabitField(index, 'description', text)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addNewTaskBtn} onPress={addNewHabit}>
        <Text style={styles.btnText}>+ Add New Task</Text>
      </TouchableOpacity>

      {habitForms.length > 0 && (
        <TouchableOpacity style={styles.updateAllBtn} onPress={updateAllHabits}>
          <Text style={styles.btnText}>✓ Save All Changes</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderWorkshopTab = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Add Workshop</Text>

      <Text style={styles.fieldLabel}>Workshop Type:</Text>
      <View style={styles.workshopTypeContainer}>
        <TouchableOpacity
          style={[styles.workshopTypeBtn, workshopForm.type === 'upcoming' && styles.workshopTypeBtnActive]}
          onPress={() => setWorkshopForm({ ...workshopForm, type: 'upcoming' })}>
          <MaterialIcons name="event" size={20} color={workshopForm.type === 'upcoming' ? '#FFFFFF' : '#063159'} />
          <Text style={[styles.workshopTypeBtnText, workshopForm.type === 'upcoming' && styles.workshopTypeBtnTextActive]}>Upcoming Workshop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.workshopTypeBtn, workshopForm.type === 'session' && styles.workshopTypeBtnActive]}
          onPress={() => setWorkshopForm({ ...workshopForm, type: 'session' })}>
          <MaterialIcons name="video-library" size={20} color={workshopForm.type === 'session' ? '#FFFFFF' : '#063159'} />
          <Text style={[styles.workshopTypeBtnText, workshopForm.type === 'session' && styles.workshopTypeBtnTextActive]}>Session Workshop</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Workshop Title"
        placeholderTextColor="#8E8E93"
        value={workshopForm.title}
        onChangeText={(text) => setWorkshopForm({ ...workshopForm, title: text })}
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description"
        placeholderTextColor="#8E8E93"
        multiline
        value={workshopForm.description}
        onChangeText={(text) => setWorkshopForm({ ...workshopForm, description: text })}
      />

      <Text style={styles.fieldLabel}>Select Level:</Text>
      <TouchableOpacity
        style={styles.levelSelectBtn}
        onPress={() => {
          setLevelModalType('workshop');
          setShowLevelModal(true);
        }}
      >
        <MaterialIcons name="layers" size={18} color="#063159" />
        <Text style={styles.levelSelectText}>
          {workshopForm.level === '1' ? 'Level 1 - NarKarma Viruthi' :
            workshopForm.level === '2' ? 'Level 2 - Suya Viruthi' :
              'Level 3 - Yoga Viruthi'}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color="#063159" />
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Start Date & Time:</Text>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowStartDatePicker(true)}>
          <MaterialIcons name="event" size={18} color="#063159" style={{ marginRight: 8 }} />
          <Text style={styles.dateTimeBtnText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowStartTimePicker(true)}>
          <MaterialIcons name="access-time" size={18} color="#063159" style={{ marginRight: 8 }} />
          <Text style={styles.dateTimeBtnText}>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}

      {workshopForm.startTime && (
        <Text style={styles.selectedDateTime}>Start: {workshopForm.startTime}</Text>
      )}

      <Text style={styles.fieldLabel}>End Date & Time:</Text>
      <View style={styles.dateTimeContainer}>
        <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowEndDatePicker(true)}>
          <MaterialIcons name="event" size={18} color="#063159" style={{ marginRight: 8 }} />
          <Text style={styles.dateTimeBtnText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateTimeBtn} onPress={() => setShowEndTimePicker(true)}>
          <MaterialIcons name="access-time" size={18} color="#063159" style={{ marginRight: 8 }} />
          <Text style={styles.dateTimeBtnText}>{endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={new Date()}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endDate}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
      )}

      {workshopForm.endTime && (
        <Text style={styles.selectedDateTime}>End: {workshopForm.endTime}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Website Link (https://...)"
        placeholderTextColor="#8E8E93"
        value={workshopForm.link}
        onChangeText={(text) => setWorkshopForm({ ...workshopForm, link: text })}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addWorkshop}>
        <Text style={styles.btnText}>{workshopForm.type === 'upcoming' ? 'Add Upcoming Workshop' : 'Add Session Workshop'}</Text>
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={18} color="#3B82F6" style={{ marginRight: 8 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoBoxTitle}>Workshop Types:</Text>
          <Text style={styles.infoBoxText}>• <Text style={{ fontWeight: '700' }}>Upcoming Workshop:</Text> Scheduled future events with specific date/time</Text>
          <Text style={styles.infoBoxText}>• <Text style={{ fontWeight: '700' }}>Session Workshop:</Text> Ongoing sessions available anytime for users</Text>
        </View>
      </View>
    </View>
  );

  const renderManifestationTab = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>{videoExists ? 'Update' : 'Add'} Manifestation Video</Text>
      <Text style={styles.infoText}>
        {videoExists
          ? 'A manifestation video already exists. You can update it below.'
          : 'Add a manifestation video for Step 2 in the daily routine.'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Video Name (e.g., Manifestation)"
        placeholderTextColor="#8E8E93"
        value={manifestationForm.name}
        onChangeText={(text) => setManifestationForm({ ...manifestationForm, name: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Video URL"
        placeholderTextColor="#8E8E93"
        value={manifestationForm.url}
        onChangeText={(text) => setManifestationForm({ ...manifestationForm, url: text })}
      />

      <TouchableOpacity style={styles.addBtn} onPress={addOrUpdateManifestationVideo}>
        <Text style={styles.btnText}>{videoExists ? 'Update Video' : 'Add Video'}</Text>
      </TouchableOpacity>

      {manifestationVideo && (
        <View style={styles.currentVideoCard}>
          <Text style={styles.currentVideoTitle}>Current Video</Text>
          <Text style={styles.currentVideoName}>{manifestationVideo.name}</Text>
          <Text style={styles.currentVideoUrl}>{manifestationVideo.url}</Text>
          <Text style={styles.currentVideoDate}>
            Last updated: {new Date(manifestationVideo.updatedAt).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('AdminDashboard')}>
          <MaterialIcons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Content Manager</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
          onPress={() => setActiveTab('videos')}
        >
          <MaterialIcons name="play-circle-outline" size={18} color={activeTab === 'videos' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>Videos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'manifestation' && styles.activeTab]}
          onPress={() => setActiveTab('manifestation')}
        >
          <MaterialIcons name="auto-awesome" size={18} color={activeTab === 'manifestation' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'manifestation' && styles.activeTabText]}>Manifestation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'habits' && styles.activeTab]}
          onPress={() => setActiveTab('habits')}
        >
          <MaterialIcons name="task-alt" size={18} color={activeTab === 'habits' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'habits' && styles.activeTabText]}>Habits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'workshops' && styles.activeTab]}
          onPress={() => setActiveTab('workshops')}
        >
          <MaterialIcons name="event" size={18} color={activeTab === 'workshops' ? '#ffb495' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'workshops' && styles.activeTabText]}>Workshops</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }}>
        {activeTab === 'videos' && renderVideoTab()}
        {activeTab === 'manifestation' && renderManifestationTab()}
        {activeTab === 'habits' && renderHabitTab()}
        {activeTab === 'workshops' && renderWorkshopTab()}
      </ScrollView>

      {/* Success Modal */}
      {successModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <MaterialIcons name="check-circle" size={56} color="#28a745" style={{ marginBottom: 16 }} />
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successDesc}>{successModal}</Text>
              <TouchableOpacity style={styles.successBtn} onPress={() => setSuccessModal(null)}>
                <Text style={styles.successBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Error Modal */}
      {errorModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <MaterialIcons name="error" size={56} color="#dc3545" style={{ marginBottom: 16 }} />
              <Text style={styles.successTitle}>Error</Text>
              <Text style={styles.successDesc}>{errorModal}</Text>
              <TouchableOpacity style={[styles.successBtn, { backgroundColor: '#dc3545' }]} onPress={() => setErrorModal(null)}>
                <Text style={styles.successBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <MaterialIcons name="warning" size={56} color="#ffc107" style={{ marginBottom: 16 }} />
              <Text style={styles.successTitle}>Delete Task?</Text>
              <Text style={styles.successDesc}>Are you sure you want to delete this task? This action cannot be undone.</Text>
              <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
                <TouchableOpacity style={[styles.successBtn, { flex: 1, backgroundColor: '#6B7280', paddingVertical: 10, paddingHorizontal: 8 }]} onPress={() => setDeleteModal(null)}>
                  <Text style={[styles.successBtnText, { fontSize: 13 }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.successBtn, { flex: 1, backgroundColor: '#dc3545', paddingVertical: 10, paddingHorizontal: 8 }]} onPress={confirmDeleteHabit}>
                  <Text style={[styles.successBtnText, { fontSize: 13 }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Level Selection Modal */}
      {showLevelModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <MaterialIcons name="layers" size={56} color="#ffb495" style={{ marginBottom: 16 }} />
              <Text style={styles.successTitle}>Select Level</Text>
              <Text style={styles.successDesc}>Choose the program level</Text>

              <TouchableOpacity
                style={styles.levelOptionBtn}
                onPress={() => {
                  if (levelModalType === 'video') {
                    const existing = getVideoForLevel(1);
                    if (existing) {
                      setVideoForm({
                        title: existing.title,
                        url: existing.url,
                        level: '1',
                        description: existing.description || '',
                        part: existing.part || null
                      });
                    } else {
                      setVideoForm({ ...videoForm, level: '1', part: null });
                    }
                  } else {
                    setWorkshopForm({ ...workshopForm, level: '1' });
                  }
                  setShowLevelModal(false);
                }}
              >
                <View style={styles.levelOptionContent}>
                  <Text style={styles.levelOptionNumber}>1</Text>
                  <View style={styles.levelOptionTextContainer}>
                    <Text style={styles.levelOptionTitle}>NarKarma Viruthi</Text>
                    <Text style={styles.levelOptionSubtitle}>Foundation Level</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.levelOptionBtn}
                onPress={() => {
                  if (levelModalType === 'video') {
                    const existing = getVideoForLevel(2);
                    if (existing) {
                      setVideoForm({
                        title: existing.title,
                        url: existing.url,
                        level: '2',
                        description: existing.description || '',
                        part: existing.part || null
                      });
                    } else {
                      setVideoForm({ ...videoForm, level: '2', part: null });
                    }
                  } else {
                    setWorkshopForm({ ...workshopForm, level: '2' });
                  }
                  setShowLevelModal(false);
                }}
              >
                <View style={styles.levelOptionContent}>
                  <Text style={styles.levelOptionNumber}>2</Text>
                  <View style={styles.levelOptionTextContainer}>
                    <Text style={styles.levelOptionTitle}>Suya Viruthi</Text>
                    <Text style={styles.levelOptionSubtitle}>Intermediate Level</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.levelOptionBtn}
                onPress={() => {
                  if (levelModalType === 'video') {
                    const existing = getVideoForLevel(3);
                    if (existing) {
                      setVideoForm({
                        title: existing.title,
                        url: existing.url,
                        level: '3',
                        description: existing.description || '',
                        part: existing.part || null
                      });
                    } else {
                      setVideoForm({ ...videoForm, level: '3', part: '1' });
                    }
                  } else {
                    setWorkshopForm({ ...workshopForm, level: '3' });
                  }
                  setShowLevelModal(false);
                }}
              >
                <View style={styles.levelOptionContent}>
                  <Text style={styles.levelOptionNumber}>3</Text>
                  <View style={styles.levelOptionTextContainer}>
                    <Text style={styles.levelOptionTitle}>Yoga Viruthi</Text>
                    <Text style={styles.levelOptionSubtitle}>Advanced Level</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: '#6B7280',shadowColor:'#2e2e2e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6, marginTop: 8 }]}
                onPress={() => setShowLevelModal(false)}
              >
                <Text style={styles.successBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Part Selection Modal */}
      {showPartModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContent}>
              <MaterialIcons name="filter-1" size={56} color="#ffb495" style={{ marginBottom: 16 }} />
              <Text style={styles.successTitle}>Select Part</Text>

              <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.successBtn, { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#ffb495' }]}
                  onPress={() => {
                    setVideoForm({ ...videoForm, part: '1' });
                    setShowPartModal(false);
                  }}
                >
                  <Text style={[styles.successBtnText, { color: '#28a745' }]}>Part 1</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.successBtn, { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#ffb495' }]}
                  onPress={() => {
                    setVideoForm({ ...videoForm, part: '2' });
                    setShowPartModal(false);
                  }}
                >
                  <Text style={[styles.successBtnText, { color: '#28a745' }]}>Part 2</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.successBtn, { backgroundColor: '#6B7280', marginTop: 16, width: '100%' }]}
                onPress={() => setShowPartModal(false)}
              >
                <Text style={styles.successBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { backgroundColor: '#04223e', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  headerTitle: { fontSize: 18, fontFamily: 'JosefinSans-Bold', color: '#FFFFFF', letterSpacing: 0.3, flex: 1, textAlign: 'center' },
  backBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'center', gap: 4 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#ffb495' },
  tabText: { fontSize: 10, color: '#6B7280', fontFamily: 'WorkSans-Medium' },
  activeTabText: { color: '#ffb495', fontFamily: 'WorkSans-Bold' },
  content: { flex: 1 },
  formContainer: { padding: 16 },
  formTitle: { fontSize: 18, fontFamily: 'JosefinSans-Bold', marginBottom: 16, color: '#063159' },
  input: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', color: '#2e2e2e', fontSize: 14, fontFamily: 'WorkSans-Regular' },
  textArea: { height: 80, textAlignVertical: 'top' },
  addBtn: { backgroundColor: '#28a745', padding: 16, borderRadius: 12, marginTop: 10, shadowColor: '#28a745', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  btnText: { color: '#FFFFFF', textAlign: 'center', fontSize: 16, fontFamily: 'WorkSans-Bold', letterSpacing: 0.5 },
  progressCard: { backgroundColor: '#FFFFFF', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  progressUser: { fontSize: 16, fontFamily: 'WorkSans-Bold', marginBottom: 10, color: '#063159' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  completed: { color: '#28a745', fontFamily: 'WorkSans-Bold' },
  pending: { color: '#6B7280', fontFamily: 'WorkSans-Regular' },
  allComplete: { color: '#ffb495', fontFamily: 'WorkSans-Bold', textAlign: 'center', marginTop: 10 },
  fieldLabel: { fontSize: 13, fontFamily: 'WorkSans-Bold', color: '#063159', marginBottom: 8, marginTop: 8 },
  scheduleButtons: { flexDirection: 'row', gap: 12, marginBottom: 15 },
  scheduleBtn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF' },
  scheduleBtnActive: { backgroundColor: '#ffb495', borderColor: '#ffb495' },
  scheduleBtnText: { color: '#063159', fontSize: 14, fontFamily: 'WorkSans-Bold', textAlign: 'center' },
  scheduleBtnTextActive: { color: '#FFFFFF' },
  pickerWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, paddingLeft: 12 },
  pickerIcon: { marginRight: 8 },
  pickerContainer: { flex: 1, overflow: 'hidden' },
  picker: { height: 48, color: '#063159', marginLeft: -8, fontFamily: 'WorkSans-Regular' },
  divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 20 },
  videosList: { marginTop: 20 },
  videosListTitle: { fontSize: 18, fontFamily: 'JosefinSans-Bold', color: '#063159', marginBottom: 15 },
  noVideos: { fontSize: 13, color: '#6B7280', textAlign: 'center', padding: 16, fontFamily: 'WorkSans-Regular' },
  videoCard: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  videoCardTitle: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#063159', marginBottom: 6 },
  videoCardDesc: { fontSize: 13, color: '#6B7280', marginBottom: 6, fontFamily: 'WorkSans-Regular' },
  videoCardUrl: { fontSize: 11, color: '#6c757d', fontFamily: 'WorkSans-Medium' },
  infoText: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 18, fontFamily: 'WorkSans-Regular' },
  currentVideoCard: { backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, marginTop: 16, borderWidth: 2, borderColor: '#ffb495' },
  currentVideoTitle: { fontSize: 12, fontFamily: 'WorkSans-Bold', color: '#2e2e2e', marginBottom: 6 },
  currentVideoName: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#063159', marginBottom: 4 },
  currentVideoUrl: { fontSize: 11, color: '#6B7280', marginBottom: 6, fontFamily: 'WorkSans-Regular' },
  currentVideoDate: { fontSize: 10, color: '#999', fontStyle: 'italic', fontFamily: 'WorkSans-Regular' },
  levelButtons: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  levelBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', alignItems: 'center' },
  levelBtnActive: { backgroundColor: '#ffb495', borderColor: '#ffb495' },
  levelBtnText: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#063159' },
  levelBtnSubtext: { fontSize: 10, color: '#6B7280', marginTop: 2, fontFamily: 'WorkSans-Regular' },
  levelBtnTextActive: { color: '#FFFFFF' },
  levelBadgeInCard: { fontSize: 11, fontFamily: 'WorkSans-Bold', color: '#ffb495', marginBottom: 6 },
  dateTimeContainer: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  dateTimeBtn: { flex: 1, backgroundColor: '#F5F7FA', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  dateTimeBtnText: { fontSize: 12, fontFamily: 'WorkSans-Medium', color: '#063159' },
  selectedDateTime: { fontSize: 11, color: '#ffb495', fontFamily: 'WorkSans-Bold', marginBottom: 12, textAlign: 'center', backgroundColor: '#F5F7FA', padding: 8, borderRadius: 6 },
  simpleTaskCard: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  taskLabel: { fontSize: 14, fontFamily: 'WorkSans-Bold', color: '#063159' },
  deleteTaskBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  deleteTaskText: { color: '#dc3545', fontSize: 11, fontFamily: 'WorkSans-Bold' },
  addNewTaskBtn: { backgroundColor: '#123f70ff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginTop: 8, marginBottom: 8, shadowColor: '#ffb495', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  updateAllBtn: { backgroundColor: '#28a745', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginTop: 8, shadowColor: '#28a745', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  noTasksContainer: { backgroundColor: '#F5F7FA', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  noTasksText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16, lineHeight: 18, fontFamily: 'WorkSans-Regular' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  workshopTypeContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  workshopTypeBtn: { flex: 1, padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  workshopTypeBtnActive: { backgroundColor: '#ffb495', borderColor: '#ffb495' },
  workshopTypeBtnText: { fontSize: 11, fontFamily: 'WorkSans-Bold', color: '#063159' },
  workshopTypeBtnTextActive: { color: '#FFFFFF' },
  infoBox: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, marginTop: 16, borderLeftWidth: 3, borderLeftColor: '#3B82F6', flexDirection: 'row', alignItems: 'flex-start' },
  infoBoxTitle: { fontSize: 12, fontFamily: 'WorkSans-Bold', color: '#063159', marginBottom: 6 },
  infoBoxText: { fontSize: 11, color: '#6B7280', marginBottom: 3, lineHeight: 16, fontFamily: 'WorkSans-Regular' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successModalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', width: '85%', maxWidth: 360, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  successIconCircle: { marginBottom: 16 },
  successTitle: { fontSize: 20, fontFamily: 'JosefinSans-Bold', color: '#063159', marginBottom: 10, textAlign: 'center' },
  successDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20, lineHeight: 20, fontFamily: 'WorkSans-Regular' },
  successBtn: { backgroundColor: '#28a745', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, width: '100%', shadowColor: '#28a745', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  successBtnText: { color: '#FFFFFF', fontSize: 15, fontFamily: 'WorkSans-Bold', textAlign: 'center', letterSpacing: 0.3 },
  levelSelectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12, gap: 10 },
  levelSelectText: { flex: 1, fontSize: 14, fontFamily: 'WorkSans-Medium', color: '#063159' },
  levelOptionBtn: { width: '100%', backgroundColor: '#F5F7FA', padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 2, borderColor: '#ffb495' },
  levelOptionContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  levelOptionNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ffb495', color: '#FFFFFF', fontSize: 20, fontFamily: 'JosefinSans-Bold', textAlign: 'center', lineHeight: 40 },
  levelOptionTextContainer: { flex: 1 },
  levelOptionTitle: { fontSize: 16, fontFamily: 'JosefinSans-Bold', color: '#063159', marginBottom: 2 },
  levelOptionSubtitle: { fontSize: 12, color: '#6B7280', fontFamily: 'WorkSans-Regular' }
});

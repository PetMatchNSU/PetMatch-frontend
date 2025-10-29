import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { PetData, PetFormData, Photo, Document } from '../types/pet';
import Input from '../components/Input/Input';
import CustomSelect from '../components/Select/Select';
import RadioButton from '../components/RadioButton/RadioButton';
import Button from '../components/Button/Button';
import styles from './EditPet.module.css';

const EditPet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [petData, setPetData] = useState<PetData | null>(null);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    speciesId: null,
    goal: '',
    cost: null,
    hasBreed: null,
    breed: '',
    gender: '',
    birthday: '',
    weight: null,
    color: '',
    geneticDiseases: '',
    description: ''
  });
  
  const [speciesOptions, setSpeciesOptions] = useState<{ value: string; label: string }[]>([]);
  const [goalOptions, setGoalOptions] = useState<{ value: string; label: string }[]>([]);
  
  const [mainPhoto, setMainPhoto] = useState<Photo | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<Photo[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Check if we're in edit mode
  const isEditMode = location.pathname.includes('/update/');
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load species and goals
        const infoResponse = await api.getAnimalInfo();
        setSpeciesOptions(infoResponse.species.map((s: any) => ({ 
          value: s.id.toString(), 
          label: s.name 
        })));
        
        setGoalOptions(infoResponse.goals.map((g: string) => ({ 
          value: g, 
          label: g === 'SELL' ? 'Продажа' : g === 'PAIRING' ? 'Случка' : 'Отдам даром' 
        })));
        
        // If in edit mode, load pet data
        if (isEditMode && id) {
          const petResponse = await api.getAnimal(parseInt(id));
          setPetData(petResponse);
          
          // Populate form data
          setFormData({
            name: petResponse.name,
            speciesId: petResponse.species.id,
            goal: petResponse.goal,
            cost: petResponse.cost,
            hasBreed: petResponse.hasBreed,
            breed: petResponse.breed || '',
            gender: petResponse.gender,
            birthday: petResponse.birthday,
            weight: petResponse.weight,
            color: petResponse.color,
            geneticDiseases: petResponse.geneticDiseases,
            description: petResponse.description
          });
          
          // Initialize photos
          if (petResponse.photos.mainPhotoId) {
            setMainPhoto({
              id: petResponse.photos.mainPhotoId,
              file: null,
              url: `https://picsum.photos/seed/${petResponse.photos.mainPhotoId}/300/300`,
              isDeleted: false
            });
          }
          
          // Initialize additional photos
          const additional = petResponse.photos.additionalIds.map((id: number, index: number) => ({
            id,
            file: null,
            url: `https://picsum.photos/seed/${id}/300/300`,
            isDeleted: false
          }));
          setAdditionalPhotos(additional);
          
          // Initialize documents
          const docEntries = Object.entries(petResponse.documents).filter(([key, value]) => value !== null);
          const initializedDocuments = docEntries.map(([key, docId], index) => ({
            id: docId as number,
            file: null,
            url: `https://example.com/document/${docId}`,
            isDeleted: false,
            type: key.replace('Id', '')
          }));
          setDocuments(initializedDocuments);
        }
      } catch (err) {
        setError('Ошибка загрузки данных');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, isEditMode]);
  
  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, mainPhoto, additionalPhotos, documents]);
  
  // Handle form field changes
  const handleInputChange = (field: keyof PetFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const photoUrl = URL.createObjectURL(file);
    
    if (isMain) {
      setMainPhoto({
        id: Date.now(),
        file,
        url: photoUrl,
        isDeleted: false
      });
    } else {
      setAdditionalPhotos(prev => [
        ...prev,
        {
          id: Date.now(),
          file,
          url: photoUrl,
          isDeleted: false
        }
      ]);
    }
  };
  
  // Handle document uploads
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setDocuments(prev => [
      ...prev,
      {
        id: Date.now(),
        file,
        url: fileUrl,
        isDeleted: false,
        type: file.name.split('.').pop() || 'unknown'
      }
    ]);
  };
  
  // Remove photo
  const removePhoto = (id: number, isMain: boolean = false) => {
    if (isMain) {
      if (mainPhoto) {
        setMainPhoto({ ...mainPhoto, isDeleted: true });
      }
    } else {
      setAdditionalPhotos(prev => 
        prev.map(photo => 
          photo.id === id ? { ...photo, isDeleted: true } : photo
        )
      );
    }
  };
  
  // Remove document
  const removeDocument = (docType: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.type === docType ? { ...doc, isDeleted: true, file: null, url: '' } : doc
    ));
  };
  
  // Add additional photo slot
  const addAdditionalPhotoSlot = () => {
    setAdditionalPhotos(prev => [
      ...prev,
      {
        id: Date.now(),
        file: null,
        url: '',
        isDeleted: false
      }
    ]);
  };
  
  // Validate form
  const isFormValid = useCallback(() => {
    return (
      formData.name.trim() !== '' &&
      formData.speciesId !== null &&
      formData.goal !== '' &&
      formData.gender !== '' &&
      formData.birthday !== '' &&
      (formData.hasBreed !== null) &&
      (formData.hasBreed === false || formData.breed.trim() !== '') &&
      (formData.goal !== 'SELL' || (formData.cost !== null && formData.cost > 0)) &&
      mainPhoto !== null && 
      !mainPhoto.isDeleted
    );
  }, [formData, mainPhoto]);
  
  // Save pet data
  const savePet = async () => {
    if (!isFormValid()) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        speciesId: formData.speciesId,
        cost: formData.goal === 'SELL' ? formData.cost : null
      };
      
      let animalId = petData?.animalId || Date.now(); // Use existing ID or generate new one
      
      // Update or create pet
      const response = await api.updateAnimal(animalId, submitData);
      animalId = response.animal_id;
      
      // Handle file uploads/deletions
      // In a real implementation, you would upload new files and delete removed ones
      
      // Show success message
      alert(isEditMode 
        ? 'Карточка животного успешно обновлена, ожидает проверки модератором перед публикацией' 
        : 'Карточка животного успешно создана');
      
      setHasUnsavedChanges(false);
      
      // Navigate back to pets page or to the pet view page
      navigate('/pets');
    } catch (err) {
      setError('При сохранении возникла ошибка, попробуйте позже');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowCancelModal(true);
    } else {
      navigate(-1);
    }
  };
  
  // Confirm cancel
  const confirmCancel = () => {
    setShowCancelModal(false);
    setHasUnsavedChanges(false);
    navigate(-1);
  };
  
  // Handle navigation away with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
  
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <form noValidate onSubmit={(e) => {
        e.preventDefault();
        savePet();
      }}>
      <div className={styles.header}>
        <h1>{isEditMode ? 'Редактирование питомца' : 'Добавление питомца'}</h1>
      </div>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      <div className={styles.form}>
        <div className={styles.formColumns}>
          <div className={styles.formColumn}>
            {/* Name */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Кличка *</div>
              <div className={styles.inputWrapper}>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Введите кличку питомца"
                />
              </div>
            </div>
            
            {/* Species */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Вид животного *</div>
              <div className={styles.inputWrapper}>
                <CustomSelect
                  options={speciesOptions}
                  value={speciesOptions.find(option => option.value === formData.speciesId?.toString()) || null}
                  onChange={(selected: any) => handleInputChange('speciesId', selected ? parseInt(selected.value) : null)}
                  placeholder="Выберите вид животного"
                />
              </div>
            </div>
            
            {/* Breed info */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Известна ли порода? *</div>
              <div className={styles.inputWrapper}>
                <RadioButton
                  name="hasBreed"
                  options={[
                    { value: 'true', label: 'Да' },
                    { value: 'false', label: 'Нет' }
                  ]}
                  selectedValue={formData.hasBreed === null ? undefined : formData.hasBreed.toString()}
                  onChange={(value) => handleInputChange('hasBreed', value === 'true')}
                  inline
                />
              </div>
            </div>
            
            {formData.hasBreed === true && (
              <div className={styles.formGroup}>
                <div className={styles.label}>Порода *</div>
                <div className={styles.inputWrapper}>
                  <Input
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="Введите породу питомца"
                  />
                </div>
              </div>
            )}
            
            {/* Gender */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Пол *</div>
              <div className={styles.inputWrapper}>
                <RadioButton
                  name="gender"
                  options={[
                    { value: 'М', label: 'Мужской' },
                    { value: 'Ж', label: 'Женский' }
                  ]}
                  selectedValue={formData.gender || undefined}
                  onChange={(value) => handleInputChange('gender', value)}
                  inline
                />
              </div>
            </div>
            
            {/* Birthday */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Дата рождения *</div>
              <div className={styles.inputWrapper}>
                <Input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleInputChange('birthday', e.target.value)}
                />
              </div>
            </div>
            
            {/* Weight */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Вес (кг)</div>
              <div className={styles.inputWrapper}>
                <Input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="Введите вес питомца"
                />
              </div>
            </div>
            
            {/* Color */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Окрас</div>
              <div className={styles.inputWrapper}>
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="Опишите окрас питомца"
                />
              </div>
            </div>
            
            {/* Genetic diseases */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Наследственные заболевания</div>
              <div className={styles.inputWrapper}>
                <Input
                  value={formData.geneticDiseases}
                  onChange={(e) => handleInputChange('geneticDiseases', e.target.value)}
                  placeholder="Опишите наследственные заболевания"
                />
              </div>
            </div>
            
            {/* Description */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Описание</div>
              <div className={styles.inputWrapper}>
                <Input
                  type="textarea"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Опишите питомца"
                />
              </div>
            </div>
          </div>
          
          <div className={styles.formColumn}>
            {/* Photos */}
            <div className={styles.section}>             
              {/* Main photo */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Основное фото *</div>
                <div className={styles.inputWrapper}>
                  <div className={styles.photoUpload}>
                    {mainPhoto && !mainPhoto.isDeleted ? (
                      <div className={styles.photoPreview}>
                        <img src={mainPhoto.url} alt="Основное фото" />
                        <button
                          type="button"
                          className={styles.removePhoto}
                          onClick={() => removePhoto(mainPhoto.id, true)}
                        >
                          Удалить
                        </button>
                      </div>
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          style={{ display: 'none' }}
                          id="main-photo-upload"
                        />
                        <label htmlFor="main-photo-upload" className={styles.uploadButton}>
                          Загрузить основное фото
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional photos */}
              <div className={styles.formGroup}>
                <div className={styles.label}>Дополнительные фото</div>
                <div className={styles.inputWrapper}>
                  <div className={styles.additionalPhotos}>
                    {additionalPhotos
                      .filter(photo => !photo.isDeleted)
                      .map(photo => (
                        <div key={photo.id} className={styles.photoPreview}>
                          <img src={photo.url} alt={`Доп. фото ${photo.id}`} />
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={() => removePhoto(photo.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    
                    <div className={styles.photoPlaceholder}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        style={{ display: 'none' }}
                        id="additional-photo-upload"
                      />
                      <label htmlFor="additional-photo-upload" className={styles.uploadButton}>
                        + Добавить фото
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents */}
            <div className={styles.section}>
              <div className={styles.formGroup}>
                <div className={styles.label}>Документы</div>
                <div className={styles.inputWrapper}>
                  <div className={styles.additionalPhotos}>
                    {documents
                      .filter(doc => !doc.isDeleted)
                      .map(doc => (
                        <div key={doc.id} className={styles.documentPreview}>
                          <div className={styles.documentName}>
                            {doc.file ? doc.file.name : 'Документ.pdf'}
                          </div>
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={() => removeDocument(doc.type)}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    
                    <div className={styles.documentPlaceholder}>
                      <input
                        type="file"
                        onChange={handleDocumentUpload}
                        style={{ display: 'none' }}
                        id="document-upload"
                      />
                      <label htmlFor="document-upload" className={styles.uploadButton}>
                        + Добавить документ
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Placement goal */}
            <div className={styles.formGroup}>
              <div className={styles.label}>Цель размещения *</div>
              <div className={styles.inputWrapper}>
                <CustomSelect
                  options={goalOptions}
                  value={goalOptions.find(option => option.value === formData.goal) || null}
                  onChange={(selected: any) => handleInputChange('goal', selected?.value || '')}
                  placeholder="Выберите цель размещения"
                />
              </div>
            </div>
            
            {/* Price */}
            {formData.goal === 'SELL' && (
              <div className={styles.formGroup}>
                <div className={styles.label}>Цена *</div>
                <div className={styles.inputWrapper}>
                  <Input
                    type="number"
                    value={formData.cost || ''}
                    onChange={(e) => handleInputChange('cost', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder="Введите цену"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Buttons */}
        <div className={styles.buttons}>
          <Button
            type="submit"
            disabled={!isFormValid() || saving}
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            onClick={handleCancel}
          >
            Отменить
          </Button>
        </div>
      </div>
      
      {/* Cancel modal */}
      {showCancelModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Вы уверены, что хотите покинуть режим редактирования?</h3>
            <p>Несохраненные изменения будут утеряны</p>
            <div className={styles.modalButtons}>
              <Button onClick={confirmCancel}>Да</Button>
              <Button onClick={() => setShowCancelModal(false)}>
                Нет
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  </div>
);
};

export default EditPet;
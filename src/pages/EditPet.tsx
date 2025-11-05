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
  
  // Separate state for each document type
  const [vetPassport, setVetPassport] = useState<Document | null>(null);
  const [pedigree, setPedigree] = useState<Document | null>(null);
  const [vetCertificate, setVetCertificate] = useState<Document | null>(null);
  const [diplomas, setDiplomas] = useState<Document | null>(null);
  const [otherDocuments, setOtherDocuments] = useState<Document | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Check if we're in edit mode
  const isEditMode = location.pathname.includes('/update/');
  
  // State for view/edit mode
  const [isViewMode, setIsViewMode] = useState(true);
  
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
          if (petResponse.documents.vetPassportId) {
            setVetPassport({
              id: petResponse.documents.vetPassportId,
              file: null,
              url: `https://example.com/document/${petResponse.documents.vetPassportId}`,
              isDeleted: false,
              type: 'vetPassport'
            });
          }
          
          if (petResponse.documents.pedigreeId) {
            setPedigree({
              id: petResponse.documents.pedigreeId,
              file: null,
              url: `https://example.com/document/${petResponse.documents.pedigreeId}`,
              isDeleted: false,
              type: 'pedigree'
            });
          }
          
          if (petResponse.documents.vetCertificatesId) {
            setVetCertificate({
              id: petResponse.documents.vetCertificatesId,
              file: null,
              url: `https://example.com/document/${petResponse.documents.vetCertificatesId}`,
              isDeleted: false,
              type: 'vetCertificate'
            });
          }
          
          if (petResponse.documents.diplomasId) {
            setDiplomas({
              id: petResponse.documents.diplomasId,
              file: null,
              url: `https://example.com/document/${petResponse.documents.diplomasId}`,
              isDeleted: false,
              type: 'diplomas'
            });
          }
          
          if (petResponse.documents.otherDocumentsId) {
            setOtherDocuments({
              id: petResponse.documents.otherDocumentsId,
              file: null,
              url: `https://example.com/document/${petResponse.documents.otherDocumentsId}`,
              isDeleted: false,
              type: 'other'
            });
          }
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
    // Не устанавливаем флаг изменений при первой загрузке данных
    if (isEditMode && petData) {
      setHasUnsavedChanges(true);
    }
  }, [formData, mainPhoto, additionalPhotos, vetPassport, pedigree, vetCertificate, diplomas, otherDocuments, isEditMode, petData]);
  
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
  
  // File validation helper
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    
    if (!allowedTypes.includes(file.type)) {
      alert('Недопустимый формат файла. Разрешены только PDF, DOC, DOCX, JPG, PNG, JPEG.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('Файл слишком большой. Максимальный размер файла - 5 МБ.');
      return false;
    }
    
    return true;
  };
  
  // Handle document uploads for each type
  const handleVetPassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setVetPassport({
      id: Date.now(),
      file,
      url: fileUrl,
      isDeleted: false,
      type: 'vetPassport'
    });
  };
  
  const handlePedigreeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setPedigree({
      id: Date.now(),
      file,
      url: fileUrl,
      isDeleted: false,
      type: 'pedigree'
    });
  };
  
  const handleVetCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setVetCertificate({
      id: Date.now(),
      file,
      url: fileUrl,
      isDeleted: false,
      type: 'vetCertificate'
    });
  };
  
  const handleDiplomasUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setDiplomas({
      id: Date.now(),
      file,
      url: fileUrl,
      isDeleted: false,
      type: 'diplomas'
    });
  };
  
  const handleOtherDocumentsUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;
    
    const fileUrl = URL.createObjectURL(file);
    
    setOtherDocuments({
      id: Date.now(),
      file,
      url: fileUrl,
      isDeleted: false,
      type: 'other'
    });
  };
  
  // Remove document handlers for each type
  const removeVetPassport = () => {
    if (vetPassport) {
      setVetPassport({ ...vetPassport, isDeleted: true, file: null, url: '' });
    }
  };
  
  const removePedigree = () => {
    if (pedigree) {
      setPedigree({ ...pedigree, isDeleted: true, file: null, url: '' });
    }
  };
  
  const removeVetCertificate = () => {
    if (vetCertificate) {
      setVetCertificate({ ...vetCertificate, isDeleted: true, file: null, url: '' });
    }
  };
  
  const removeDiplomas = () => {
    if (diplomas) {
      setDiplomas({ ...diplomas, isDeleted: true, file: null, url: '' });
    }
  };
  
  const removeOtherDocuments = () => {
    if (otherDocuments) {
      setOtherDocuments({ ...otherDocuments, isDeleted: true, file: null, url: '' });
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
    // Не сохраняем в режиме просмотра
    if (isViewMode) {
      return;
    }
    
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
        // Сохраняем только если не в режиме просмотра
        if (!isViewMode) {
          savePet();
        }
      }}>
      <div className={styles.header}>
        <h1>{isEditMode ? 'Редактирование питомца' : 'Добавление питомца'}</h1>
        {isEditMode && (
          <Button
            type="button"
            onClick={() => {
              if (!isViewMode) {
                // Переход из режима редактирования в режим просмотра без сохранения
                setHasUnsavedChanges(false);
              }
              setIsViewMode(!isViewMode);
            }}
            className={styles.editButton}
          >
            {isViewMode ? 'Редактировать' : 'Отменить'}
          </Button>
        )}
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
                  disabled={isViewMode}
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
                  isDisabled={isViewMode}
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
                  disabled={isViewMode}
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
                    disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                  disabled={isViewMode}
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
                        {!isViewMode && (
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={() => removePhoto(mainPhoto.id, true)}
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    ) : !isViewMode ? (
                      <div className={styles.photoPlaceholder}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, true)}
                          style={{ display: 'none' }}
                          id="main-photo-upload"
                          disabled={isViewMode}
                        />
                        <label htmlFor="main-photo-upload" className={styles.uploadButton}>
                          Загрузить основное фото
                        </label>
                      </div>
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        Основное фото не загружено
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
                          {!isViewMode && (
                            <button
                              type="button"
                              className={styles.removePhoto}
                              onClick={() => removePhoto(photo.id)}
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      ))}
                    
                    {!isViewMode && (
                      <div className={styles.photoPlaceholder}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          style={{ display: 'none' }}
                          id="additional-photo-upload"
                          disabled={isViewMode}
                        />
                        <label htmlFor="additional-photo-upload" className={styles.uploadButton}>
                          + Добавить фото
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Documents */}
            <div className={styles.section}>
              <div className={styles.formGroup}>
                <div className={styles.label}>Документы</div>
                <div className={styles.inputWrapper}>
                  <div className={styles.documentSection}>
                    {/* Veterinary Passport */}
                    <div className={styles.documentItem}>
                      <div className={styles.documentLabel}>Ветеринарный паспорт</div>
                      <div className={styles.documentUpload}>
                        {vetPassport && !vetPassport.isDeleted ? (
                          <div className={styles.documentPreview}>
                            <div className={styles.documentName}>
                              {vetPassport.file ? vetPassport.file.name : 'vet_passport.pdf'}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                className={styles.removeDocument}
                                onClick={removeVetPassport}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : !isViewMode ? (
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handleVetPassportUpload}
                              style={{ display: 'none' }}
                              id="vet-passport-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              disabled={isViewMode}
                            />
                            <label htmlFor="vet-passport-upload" className={styles.uploadButton}>
                              Загрузить
                            </label>
                          </div>
                        ) : (
                          <div className={styles.documentPlaceholder}>
                            Ветеринарный паспорт не загружен
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Pedigree */}
                    <div className={styles.documentItem}>
                      <div className={styles.documentLabel}>Родословная (метрика)</div>
                      <div className={styles.documentUpload}>
                        {pedigree && !pedigree.isDeleted ? (
                          <div className={styles.documentPreview}>
                            <div className={styles.documentName}>
                              {pedigree.file ? pedigree.file.name : 'pedigree.pdf'}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                className={styles.removeDocument}
                                onClick={removePedigree}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : !isViewMode ? (
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handlePedigreeUpload}
                              style={{ display: 'none' }}
                              id="pedigree-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              disabled={isViewMode}
                            />
                            <label htmlFor="pedigree-upload" className={styles.uploadButton}>
                              Загрузить
                            </label>
                          </div>
                        ) : (
                          <div className={styles.documentPlaceholder}>
                            Родословная не загружена
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Veterinary Certificate */}
                    <div className={styles.documentItem}>
                      <div className={styles.documentLabel}>Ветеринарная справка</div>
                      <div className={styles.documentUpload}>
                        {vetCertificate && !vetCertificate.isDeleted ? (
                          <div className={styles.documentPreview}>
                            <div className={styles.documentName}>
                              {vetCertificate.file ? vetCertificate.file.name : 'vet_certificate.pdf'}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                className={styles.removeDocument}
                                onClick={removeVetCertificate}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : !isViewMode ? (
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handleVetCertificateUpload}
                              style={{ display: 'none' }}
                              id="vet-certificate-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              disabled={isViewMode}
                            />
                            <label htmlFor="vet-certificate-upload" className={styles.uploadButton}>
                              Загрузить
                            </label>
                          </div>
                        ) : (
                          <div className={styles.documentPlaceholder}>
                            Ветеринарная справка не загружена
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Diplomas */}
                    <div className={styles.documentItem}>
                      <div className={styles.documentLabel}>Дипломы</div>
                      <div className={styles.documentUpload}>
                        {diplomas && !diplomas.isDeleted ? (
                          <div className={styles.documentPreview}>
                            <div className={styles.documentName}>
                              {diplomas.file ? diplomas.file.name : 'diplomas.pdf'}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                className={styles.removeDocument}
                                onClick={removeDiplomas}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : !isViewMode ? (
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handleDiplomasUpload}
                              style={{ display: 'none' }}
                              id="diplomas-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              disabled={isViewMode}
                            />
                            <label htmlFor="diplomas-upload" className={styles.uploadButton}>
                              Загрузить
                            </label>
                          </div>
                        ) : (
                          <div className={styles.documentPlaceholder}>
                            Дипломы не загружены
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Other Documents */}
                    <div className={styles.documentItem}>
                      <div className={styles.documentLabel}>Другое</div>
                      <div className={styles.documentUpload}>
                        {otherDocuments && !otherDocuments.isDeleted ? (
                          <div className={styles.documentPreview}>
                            <div className={styles.documentName}>
                              {otherDocuments.file ? otherDocuments.file.name : 'other_documents.pdf'}
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                className={styles.removeDocument}
                                onClick={removeOtherDocuments}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ) : !isViewMode ? (
                          <div className={styles.documentPlaceholder}>
                            <input
                              type="file"
                              onChange={handleOtherDocumentsUpload}
                              style={{ display: 'none' }}
                              id="other-documents-upload"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              disabled={isViewMode}
                            />
                            <label htmlFor="other-documents-upload" className={styles.uploadButton}>
                              Загрузить
                            </label>
                          </div>
                        ) : (
                          <div className={styles.documentPlaceholder}>
                            Другие документы не загружены
                          </div>
                        )}
                      </div>
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
                  isDisabled={isViewMode}
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
                    disabled={isViewMode}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Buttons */}
        {!isViewMode && (
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
        )}
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
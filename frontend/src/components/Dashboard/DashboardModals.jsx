import React from 'react';
import DeleteConfirmationModals from './modals/DeleteConfirmationModals';
import RetryConfirmationModal from './modals/RetryConfirmationModal';
import CarouselDetailsModal from './modals/CarouselDetailsModal';
import CaptionEditModal from './modals/CaptionEditModal';
import PublishModals from './modals/PublishModals';

export default function DashboardModals({
  deleteTargetId,
  setDeleteTargetId,
  confirmDeleteIndividual,
  isBulkDeleteModalOpen,
  setIsBulkDeleteModalOpen,
  selectedCount,
  confirmDeleteBulk,
  retryTargetId,
  setRetryTargetId,
  confirmRetry,
  selectedDetailsCarousel,
  setSelectedDetailsCarousel,
  handleOpenCaptionModal,
  isCaptionMaximized,
  setIsCaptionMaximized,
  editedCaption,
  setEditedCaption,
  handleSaveCaption,
  isSavingCaption,
  confirmPublishCarousel,
  setConfirmPublishCarousel,
  isScheduleMode,
  setIsScheduleMode,
  scheduledDateTime,
  setScheduledDateTime,
  executePublish,
  publishResultModal,
  setPublishResultModal,
  copiedError,
  setCopiedError,
  showToast
}) {
  return (
    <>
      <DeleteConfirmationModals
        deleteTargetId={deleteTargetId}
        setDeleteTargetId={setDeleteTargetId}
        confirmDeleteIndividual={confirmDeleteIndividual}
        isBulkDeleteModalOpen={isBulkDeleteModalOpen}
        setIsBulkDeleteModalOpen={setIsBulkDeleteModalOpen}
        selectedCount={selectedCount}
        confirmDeleteBulk={confirmDeleteBulk}
      />

      <RetryConfirmationModal
        retryTargetId={retryTargetId}
        setRetryTargetId={setRetryTargetId}
        confirmRetry={confirmRetry}
      />

      <CarouselDetailsModal
        selectedDetailsCarousel={selectedDetailsCarousel}
        setSelectedDetailsCarousel={setSelectedDetailsCarousel}
        handleOpenCaptionModal={handleOpenCaptionModal}
      />

      <CaptionEditModal
        isCaptionMaximized={isCaptionMaximized}
        setIsCaptionMaximized={setIsCaptionMaximized}
        selectedDetailsCarousel={selectedDetailsCarousel}
        editedCaption={editedCaption}
        setEditedCaption={setEditedCaption}
        handleSaveCaption={handleSaveCaption}
        isSavingCaption={isSavingCaption}
        showToast={showToast}
      />

      <PublishModals
        confirmPublishCarousel={confirmPublishCarousel}
        setConfirmPublishCarousel={setConfirmPublishCarousel}
        isScheduleMode={isScheduleMode}
        setIsScheduleMode={setIsScheduleMode}
        scheduledDateTime={scheduledDateTime}
        setScheduledDateTime={setScheduledDateTime}
        executePublish={executePublish}
        publishResultModal={publishResultModal}
        setPublishResultModal={setPublishResultModal}
        copiedError={copiedError}
        setCopiedError={setCopiedError}
        showToast={showToast}
      />
    </>
  );
}

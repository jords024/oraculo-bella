import React from 'react';
import AgentPromptList from './AgentPromptList';
import PromptEditorArea from './PromptEditorArea';
import { usePromptsIO } from './usePromptsIO';

export default function PromptsTab({
  prompts,
  selectedPromptId,
  promptContent,
  setPromptContent,
  promptSaving,
  handleSelectPrompt,
  handleSavePrompt,
  isMaximized,
  setIsMaximized,
  isRenaming,
  setIsRenaming,
  tempName,
  setTempName,
  handleRenamePrompt,
  activePrompt,
  editorStyles,
  showToast
}) {
  const lineCount = promptContent ? promptContent.split('\n').length : 1;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const { importInputRef, handleExport, handleImport } = usePromptsIO({ prompts, showToast });

  return (
    <div
      className="prompts-settings-container"
      style={{
        display: 'flex',
        gap: '20px',
        height: 'calc(100vh - 240px)',
        minHeight: '450px'
      }}
    >
      <AgentPromptList
        prompts={prompts}
        selectedPromptId={selectedPromptId}
        handleSelectPrompt={handleSelectPrompt}
        handleRenamePrompt={handleRenamePrompt}
      />

      <PromptEditorArea
        editorStyles={editorStyles}
        isRenaming={isRenaming}
        setIsRenaming={setIsRenaming}
        tempName={tempName}
        setTempName={setTempName}
        handleRenamePrompt={handleRenamePrompt}
        activePrompt={activePrompt}
        selectedPromptId={selectedPromptId}
        lineCount={lineCount}
        lineNumbers={lineNumbers}
        handleExport={handleExport}
        importInputRef={importInputRef}
        handleImport={handleImport}
        isMaximized={isMaximized}
        setIsMaximized={setIsMaximized}
        handleSavePrompt={handleSavePrompt}
        promptSaving={promptSaving}
        promptContent={promptContent}
        setPromptContent={setPromptContent}
      />
    </div>
  );
}

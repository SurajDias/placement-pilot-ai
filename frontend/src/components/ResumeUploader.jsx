const roles = [
  'Software Engineer',
  'Java Developer',
  'Data Analyst',
  'Cloud Engineer',
]

function ResumeUploader({
  file,
  targetRole,
  isLoading,
  onFileChange,
  onRoleChange,
  onSubmit,
}) {
  const handleFileInput = (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) onFileChange(selectedFile)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const droppedFile = event.dataTransfer.files?.[0]
    if (droppedFile) onFileChange(droppedFile)
  }

  const preventDefault = (event) => {
    event.preventDefault()
  }

  return (
    <form className="analysis-form" onSubmit={onSubmit}>
      <label
        className="drop-zone"
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        onDrop={handleDrop}
      >
        <input type="file" accept="application/pdf,.pdf" onChange={handleFileInput} />
        <span className="drop-title">Upload PDF resume</span>
        <span className="drop-copy">
          Drag and drop your PDF here, or click to browse.
        </span>
        {file && <span className="file-name">{file.name}</span>}
      </label>

      <label className="field-label">
        Target role
        <select
          value={targetRole}
          onChange={(event) => onRoleChange(event.target.value)}
        >
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Upload'}
      </button>
    </form>
  )
}

export default ResumeUploader

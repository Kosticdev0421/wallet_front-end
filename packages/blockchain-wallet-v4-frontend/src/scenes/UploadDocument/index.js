import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import { actions, selectors } from 'data'
import UploadDocument from './template'

class UploadDocumentContainer extends Component {
  static propTypes = {
    displayError: PropTypes.func.isRequired,
    pathname: PropTypes.string.isRequired,
    uploaded: PropTypes.bool.isRequired,
    uploadDocument: PropTypes.func.isRequired
  }

  constructor (props) {
    super(props)
    this.dropzone = null

    this.state = {
      submitted: false,
      files: []
    }
  }

  onSubmit = () => {
    this.setState({ submitted: true })
    let filesLoaded = []
    const token = this.props.pathname.split('/')[2]
    this.state.files.forEach(file => {
      const fileReader = new FileReader()
      // One single upload for the array of all byte arrays
      fileReader.onload = event => {
        const fileArray = new Int8Array(event.target.result)
        filesLoaded.push(fileArray)
        if (filesLoaded.length >= this.state.files.length) {
          this.props.uploadDocument(token, filesLoaded)
        }
      }
      fileReader.readAsArrayBuffer(file)
    })
  }

  deleteFileAt = index => {
    this.setState(previousState => {
      previousState.files.splice(index, 1)
      return {
        files: previousState.files
      }
    })
  }

  onDropAccepted = files => {
    const fileSizeLimit = 3 * 1024 * 1024
    files.forEach(file => {
      if (file.size >= fileSizeLimit) {
        this.props.displayError('File over size limit')
      } else if (this.state.files.length >= 3) {
        this.props.displayError('Maximum number of files reached')
      } else {
        this.setState(previousState => ({
          files: [...previousState.files, file]
        }))
      }
    })
  }

  openDropzone = () => {
    if (this.dropzone) this.dropzone.open()
  }

  setDropzoneRef = element => {
    this.dropzone = element
  }

  render () {
    const documentType = this.props.pathname.split('/')[3]
    return (
      <UploadDocument
        documentType={documentType}
        dropzoneRef={this.dropzoneRef}
        files={this.state.files}
        deleteFileAt={this.deleteFileAt}
        onDropAccepted={this.onDropAccepted}
        onSubmit={this.onSubmit}
        uploaded={this.props.uploaded}
        setDropzoneRef={this.setDropzoneRef}
        submitted={this.state.submitted}
        openDropzone={this.openDropzone}
      />
    )
  }
}

const mapStateToProps = state => ({
  pathname: selectors.router.getPathname(state),
  uploaded: selectors.components.uploadDocument.getUploaded(state)
})

const mapDispatchToProps = dispatch => ({
  displayError: bindActionCreators(actions.alerts.displayError, dispatch),
  uploadDocument: bindActionCreators(
    actions.components.uploadDocument.upload,
    dispatch
  )
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UploadDocumentContainer)

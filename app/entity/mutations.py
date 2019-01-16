from .login import AcceptLegal
from .resource import (
    AddRepositories, RemoveRepositories,
    AddEnvironments, RemoveEnvironments
)
from .user import (
    GrantUserAccess, RemoveUserAccess,
    EditUser
)
from .vulnerability import (
    UploadFile, DeleteVulnerability
)
from .finding import (
    UpdateEvidence, UpdateSeverity,
    UpdateEvidenceDescription,
    AddFindingComment, VerifyFinding
)
from .project import AddProjectComment
from graphene import ObjectType

class Mutations(ObjectType):
    acceptLegal = AcceptLegal.Field()

    addRepositories = AddRepositories.Field()
    removeRepositories = RemoveRepositories.Field()
    addEnvironments = AddEnvironments.Field()
    removeEnvironments = RemoveEnvironments.Field()

    uploadFile = UploadFile.Field()
    deleteVulnerability = DeleteVulnerability.Field()

    grantUserAccess = GrantUserAccess.Field()
    removeUserAccess = RemoveUserAccess.Field()
    editUser = EditUser.Field()

    updateEvidence = UpdateEvidence.Field()
    updateEvidenceDescription = UpdateEvidenceDescription.Field()

    updateSeverity = UpdateSeverity.Field()

    addProjectComment = AddProjectComment.Field()
    addFindingComment = AddFindingComment.Field()

    verifyFinding = VerifyFinding.Field()

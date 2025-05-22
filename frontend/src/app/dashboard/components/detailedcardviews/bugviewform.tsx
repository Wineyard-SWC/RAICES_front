import { Calendar, Clock, AlertTriangle,
         Monitor, Globe, Smartphone, Tag,
         FileText, CheckCircle, Link,
         GitPullRequest, User, Users,
         Hash, GitBranch } from "lucide-react";

import { Bug as BugType } from "@/types/bug";

interface BugViewFormProps {
  task: BugType;
}

const BugViewForm = ({ task }: BugViewFormProps) => {
  return (
    <>
      {/* Title */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Title:</p>
        <p className="text-black text-lg">{task.title}</p>
      </div>

      {/* Description */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Description:</p>
        <p className="text-black text-lg">{task.description}</p>
      </div>

      {/* Priority */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Priority:</p>
        <p className="text-black text-lg">{task.priority}</p>
      </div>

      {/* Bug Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Bug Status:</p>
        <p className="text-black text-lg">{task.bug_status}</p>
      </div>

      {/* Kanban Status */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Kanban Status:</p>
        <p className="text-black text-lg">{task.status_khanban}</p>
      </div>

      {/* Severity */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Severity:</p>
        <p className="text-black text-lg">{task.severity}</p>
      </div>

      {/* Bug Type */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Bug Type:</p>
        <p className="text-black text-lg">{task.type}</p>
      </div>

      {/* Related Task */}
      {task.taskRelated && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Related Task:</p>
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.taskRelated}</p>
          </div>
        </div>
      )}

      {/* Related User Story */}
      {task.userStoryRelated && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Related User Story:</p>
          <div className="flex items-center">
            <Hash className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.userStoryRelated}</p>
          </div>
        </div>
      )}

      {/* Sprint */}
      {task.sprintId && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Sprint:</p>
          <div className="flex items-center">
            <GitBranch className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.sprintId}</p>
          </div>
        </div>
      )}

      {/* Reported By */}
      {task.reportedBy && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Reported By:</p>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <p className="text-black text-lg">{task.reportedBy.users[1]} </p>
          </div>
        </div>
      )}

      {/* Assignees */}
      {task.assignee && task.assignee.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Assignees:</p>
          <div className="space-y-1">
            {task.assignee.map((assignee, index) => (
              <div key={index} className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <p className="text-black text-lg">{assignee.users[1]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visible to Customers Warning */}
      {task.visibleToCustomers && (
        <div className="bg-red-50 p-3 rounded-lg shadow-sm border border-red-200">
          <p className="text-lg text-red-600 font-semibold flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Bug is visible to customers
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Timeline:</p>
        <div className="space-y-2">
          {task.createdAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Created:</span>
              <span className="ml-2 text-lg">{new Date(task.createdAt).toLocaleString()}</span>
            </div>
          )}
          {task.modifiedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Modified:</span>
              <span className="ml-2 text-lg">{new Date(task.modifiedAt).toLocaleString()}</span>
            </div>
          )}
          {task.triageDate && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Triaged:</span>
              <span className="ml-2 text-lg">{new Date(task.triageDate).toLocaleString()}</span>
            </div>
          )}
          {task.startedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Started:</span>
              <span className="ml-2 text-lg">{new Date(task.startedAt).toLocaleString()}</span>
            </div>
          )}
          {task.finishedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Finished:</span>
              <span className="ml-2 text-lg">{new Date(task.finishedAt).toLocaleString()}</span>
            </div>
          )}
          {task.closedAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              <span className="font-medium text-lg">Closed:</span>
              <span className="ml-2 text-lg">{new Date(task.closedAt).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expected vs Actual Behavior */}
      {(task.expectedBehavior || task.actualBehavior) && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Behavior:</p>
          {task.expectedBehavior && (
            <div className="mb-2">
              <span className="font-medium text-lg">Expected:</span>
              <p className="text-black text-lg mt-1">{task.expectedBehavior}</p>
            </div>
          )}
          {task.actualBehavior && (
            <div>
              <span className="font-medium text-lg">Actual:</span>
              <p className="text-black text-lg mt-1">{task.actualBehavior}</p>
            </div>
          )}
        </div>
      )}

      {/* Environment Details */}
      {task.environment && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Environment: </p>
          <div className="grid grid-cols-1 gap-1 text-lg">
            {task.environment.os && (
              <div className="flex items-center">
                <Monitor className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">OS: </span> {" "+ task.environment.os}
              </div>
            )}
            {task.environment.browser && (
              <div className="flex items-center">
                <Globe className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Browser: </span> {" "+ task.environment.browser}
              </div>
            )}
            {task.environment.device && (
              <div className="flex items-center">
                <Smartphone className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Device: </span> {" "+ task.environment.device}
              </div>
            )}
            {task.environment.version && (
              <div className="flex items-center">
                <Tag className="h-3 w-3 mr-2 text-gray-500" />
                <span className="font-medium text-lg">Version: </span> {" "+ task.environment.version}
              </div>
            )}
          </div>
          {task.environment.otherDetails && (
            <div className="mt-2 text-lg flex items-start">
              <FileText className="h-3 w-3 mr-2 text-gray-500 mt-0.5" />
              <div>
                <span className="font-medium text-lg">Notes: </span> {" "+ task.environment.otherDetails}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Affected Components */}
      {task.affectedComponents && task.affectedComponents.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Affected Components:</p>
          <div className="flex flex-wrap gap-1">
            {task.affectedComponents.map((component, idx) => (
              <span key={idx} className="bg-gray-100 px-2 py-1 rounded-md text-lg">
                {component}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Tags:</p>
          <div className="flex flex-wrap gap-1">
            {task.tags.map((tag, idx) => (
              <span key={idx} className="bg-blue-100 px-2 py-1 rounded-md text-lg text-blue-800">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Steps to Reproduce */}
      {task.stepsToReproduce && task.stepsToReproduce.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Steps to Reproduce:</p>
          <ol className="list-decimal pl-4 space-y-1">
            {task.stepsToReproduce.map((step, index) => (
              <li key={index} className="text-lg">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Metrics */}
      {(task.timeToPrioritize !== undefined || task.timeToAssign !== undefined || task.timeToFix !== undefined || task.reopenCount !== undefined || task.affectedUsers !== undefined) && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2">Metrics:</p>
          <div className="space-y-1">
            {task.timeToPrioritize !== undefined && (
              <div><span className="font-medium text-lg">Time to Prioritize:</span> {task.timeToPrioritize} hours</div>
            )}
            {task.timeToAssign !== undefined && (
              <div><span className="font-medium text-lg">Time to Assign:</span> {task.timeToAssign} hours</div>
            )}
            {task.timeToFix !== undefined && (
              <div><span className="font-medium text-lg">Time to Fix:</span> {task.timeToFix} hours</div>
            )}
            {task.reopenCount !== undefined && (
              <div><span className="font-medium text-lg">Reopen Count:</span> {task.reopenCount}</div>
            )}
            {task.affectedUsers !== undefined && (
              <div><span className="font-medium text-lg">Affected Users:</span> {task.affectedUsers}</div>
            )}
          </div>
        </div>
      )}

      {/* Regression Info */}
      {task.isRegression !== undefined && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Regression:</p>
          <p className="text-black text-lg">{task.isRegression ? "Yes" : "No"}</p>
        </div>
      )}

      {/* Related Bugs */}
      {task.relatedBugs && task.relatedBugs.length > 0 && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Related Bugs:</p>
          <div className="space-y-1">
            {task.relatedBugs.map((bugId, index) => (
              <div key={index} className="text-lg">{bugId}</div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Of */}
      {task.duplicateOf && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-1">Duplicate Of:</p>
          <p className="text-black text-lg">{task.duplicateOf}</p>
        </div>
      )}

      {/* Resolution Details */}
      {task.resolution && (
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <p className="font-semibold text-[#4A2B4A] text-lg mb-2 flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Resolution:
          </p>
          <div className="space-y-1 text-lg">
            <div><span className="font-medium text-lg">Status:</span> {task.resolution.status}</div>
            <div><span className="font-medium text-lg">Description:</span> {task.resolution.description}</div>
            
            {task.resolution.commitId && (
              <div className="flex items-center">
                <Link className="h-3 w-3 mr-1 text-[#4A2B4A]" />
                <span className="font-medium text-lg">Commit:</span> {task.resolution.commitId}
              </div>
            )}
            
            {task.resolution.pullRequestUrl && (
              <div className="flex items-center">
                <GitPullRequest className="h-3 w-3 mr-1 text-[#4A2B4A]" />
                <span className="font-medium text-lg">PR:</span>{" "}
                <a href={task.resolution.pullRequestUrl} className="text-blue-600 underline ml-1 text-lg">
                  View PR
                </a>
              </div>
            )}
            
            <div>
              <span className="font-medium">Resolved by:</span> {task.resolution.resolvedBy}
            </div>
            
            {task.resolution.resolvedAt && (
              <div>
                <span className="font-medium text-lg">Resolved at:</span>{" "}
                {new Date(task.resolution.resolvedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BugViewForm;
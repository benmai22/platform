//
// Copyright © 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import type { Employee, EmployeeAccount } from '@hcengineering/contact'
import contact from '@hcengineering/contact'
import {
  DateRangeMode,
  Domain,
  DOMAIN_MODEL,
  FindOptions,
  IndexKind,
  Markup,
  Ref,
  RelatedDocument,
  SortingOrder,
  Timestamp,
  Type
} from '@hcengineering/core'
import {
  ArrOf,
  Builder,
  Collection,
  Hidden,
  Index,
  Model,
  Prop,
  ReadOnly,
  TypeDate,
  TypeMarkup,
  TypeNumber,
  TypeRef,
  TypeString,
  TypeTimestamp,
  UX
} from '@hcengineering/model'
import attachment from '@hcengineering/model-attachment'
import chunter from '@hcengineering/model-chunter'
import core, { DOMAIN_SPACE, TAttachedDoc, TDoc, TSpace, TStatus, TType } from '@hcengineering/model-core'
import view, { actionTemplates, classPresenter, createAction } from '@hcengineering/model-view'
import workbench, { createNavigateAction } from '@hcengineering/model-workbench'
import notification from '@hcengineering/notification'
import { IntlString } from '@hcengineering/platform'
import setting from '@hcengineering/setting'
import tags, { TagElement } from '@hcengineering/tags'
import task from '@hcengineering/task'
import {
  Component,
  ComponentStatus,
  Issue,
  IssueChildInfo,
  IssueParentInfo,
  IssuePriority,
  IssueStatus,
  IssueTemplate,
  IssueTemplateChild,
  Project,
  Scrum,
  ScrumRecord,
  Sprint,
  SprintStatus,
  TimeReportDayType,
  TimeSpendReport,
  trackerId
} from '@hcengineering/tracker'
import { KeyBinding, ViewOptionsModel } from '@hcengineering/view'
import tracker from './plugin'

import presentation from '@hcengineering/model-presentation'
import { defaultPriorities, issuePriorities } from '@hcengineering/tracker-resources/src/types'

export { trackerOperation } from './migration'
export { default } from './plugin'

export const DOMAIN_TRACKER = 'tracker' as Domain

/**
 * @public
 */
@Model(tracker.class.IssueStatus, core.class.Status)
export class TIssueStatus extends TStatus implements IssueStatus {}

/**
 * @public
 */
export function TypeIssuePriority (): Type<IssuePriority> {
  return { _class: tracker.class.TypeIssuePriority, label: tracker.string.TypeIssuePriority }
}

/**
 * @public
 */
@Model(tracker.class.TypeIssuePriority, core.class.Type, DOMAIN_MODEL)
export class TTypeIssuePriority extends TType {}

/**
 * @public
 */
export function TypeComponentStatus (): Type<ComponentStatus> {
  return { _class: tracker.class.TypeComponentStatus, label: 'TypeComponentStatus' as IntlString }
}

/**
 * @public
 */
export function TypeSprintStatus (): Type<SprintStatus> {
  return { _class: tracker.class.TypeSprintStatus, label: 'TypeSprintStatus' as IntlString }
}

/**
 * @public
 */
@Model(tracker.class.TypeComponentStatus, core.class.Type, DOMAIN_MODEL)
export class TTypeComponentStatus extends TType {}

/**
 * @public
 */
@Model(tracker.class.TypeSprintStatus, core.class.Type, DOMAIN_MODEL)
export class TTypeSprintStatus extends TType {}

/**
 * @public
 */
@Model(tracker.class.Project, core.class.Space, DOMAIN_SPACE)
@UX(tracker.string.Project, tracker.icon.Project, 'Project')
export class TProject extends TSpace implements Project {
  @Prop(TypeString(), tracker.string.Identifier)
  @Index(IndexKind.FullText)
    identifier!: IntlString

  @Prop(TypeNumber(), tracker.string.Number)
  @Hidden()
    sequence!: number

  @Prop(Collection(tracker.class.IssueStatus), tracker.string.IssueStatuses)
    issueStatuses!: number

  @Prop(TypeRef(tracker.class.IssueStatus), tracker.string.DefaultIssueStatus)
    defaultIssueStatus!: Ref<IssueStatus>

  @Prop(TypeRef(contact.class.Employee), tracker.string.DefaultAssignee)
    defaultAssignee!: Ref<Employee>

  declare defaultTimeReportDay: TimeReportDayType
}

/**
 * @public
 */
export function TypeReportedTime (): Type<number> {
  return { _class: tracker.class.TypeReportedTime, label: core.string.Number }
}

/**
 * @public
 */
@Model(tracker.class.Issue, core.class.AttachedDoc, DOMAIN_TRACKER)
@UX(tracker.string.Issue, tracker.icon.Issue, 'TSK', 'title')
export class TIssue extends TAttachedDoc implements Issue {
  @Prop(TypeRef(tracker.class.Issue), tracker.string.Parent)
  declare attachedTo: Ref<Issue>

  @Prop(TypeString(), tracker.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeMarkup(), tracker.string.Description)
  @Index(IndexKind.FullText)
    description!: Markup

  @Prop(TypeRef(tracker.class.IssueStatus), tracker.string.Status, { _id: tracker.attribute.IssueStatus })
  @Index(IndexKind.Indexed)
    status!: Ref<IssueStatus>

  @Prop(TypeIssuePriority(), tracker.string.Priority)
  @Index(IndexKind.Indexed)
    priority!: IssuePriority

  @Prop(TypeNumber(), tracker.string.Number)
  @Index(IndexKind.FullText)
    number!: number

  @Prop(TypeRef(contact.class.Employee), tracker.string.Assignee)
  @Index(IndexKind.Indexed)
    assignee!: Ref<Employee> | null

  @Prop(TypeRef(tracker.class.Component), tracker.string.Component)
  @Index(IndexKind.Indexed)
    component!: Ref<Component> | null

  @Prop(Collection(tracker.class.Issue), tracker.string.SubIssues)
    subIssues!: number

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), tracker.string.BlockedBy)
    blockedBy!: RelatedDocument[]

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), tracker.string.RelatedTo)
  @Index(IndexKind.Indexed)
    relations!: RelatedDocument[]

  parents!: IssueParentInfo[]

  @Prop(Collection(chunter.class.Comment), tracker.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), tracker.string.Attachments)
    attachments!: number

  @Prop(Collection(tags.class.TagReference), tracker.string.Labels)
    labels?: number

  declare space: Ref<Project>

  @Prop(TypeDate(DateRangeMode.DATETIME), tracker.string.DueDate)
    dueDate!: Timestamp | null

  @Prop(TypeString(), tracker.string.Rank)
  @Hidden()
    rank!: string

  @Prop(TypeRef(tracker.class.Sprint), tracker.string.Sprint)
  @Index(IndexKind.Indexed)
    sprint!: Ref<Sprint> | null

  @Prop(TypeNumber(), tracker.string.Estimation)
    estimation!: number

  @Prop(TypeReportedTime(), tracker.string.ReportedTime)
  @ReadOnly()
    reportedTime!: number

  @Prop(Collection(tracker.class.TimeSpendReport), tracker.string.TimeSpendReports)
    reports!: number

  @Prop(TypeTimestamp(), tracker.string.CreatedOn)
  @ReadOnly()
    createOn!: Timestamp

  declare childInfo: IssueChildInfo[]
}

/**
 * @public
 */
@Model(tracker.class.IssueTemplate, core.class.Doc, DOMAIN_TRACKER)
@UX(tracker.string.IssueTemplate, tracker.icon.Issue, 'PROCESS')
export class TIssueTemplate extends TDoc implements IssueTemplate {
  @Prop(TypeString(), tracker.string.Title)
  @Index(IndexKind.FullText)
    title!: string

  @Prop(TypeMarkup(), tracker.string.Description)
  @Index(IndexKind.FullText)
    description!: Markup

  @Prop(TypeIssuePriority(), tracker.string.Priority)
    priority!: IssuePriority

  @Prop(TypeRef(contact.class.Employee), tracker.string.Assignee)
    assignee!: Ref<Employee> | null

  @Prop(TypeRef(tracker.class.Component), tracker.string.Component)
    component!: Ref<Component> | null

  @Prop(ArrOf(TypeRef(tags.class.TagElement)), tracker.string.Labels)
    labels?: Ref<TagElement>[]

  declare space: Ref<Project>

  @Prop(TypeDate(DateRangeMode.DATETIME), tracker.string.DueDate)
    dueDate!: Timestamp | null

  @Prop(TypeRef(tracker.class.Sprint), tracker.string.Sprint)
    sprint!: Ref<Sprint> | null

  @Prop(TypeNumber(), tracker.string.Estimation)
    estimation!: number

  @Prop(ArrOf(TypeRef(tracker.class.IssueTemplate)), tracker.string.IssueTemplate)
    children!: IssueTemplateChild[]

  @Prop(Collection(chunter.class.Comment), tracker.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), tracker.string.Attachments)
    attachments!: number

  @Prop(ArrOf(TypeRef(core.class.TypeRelatedDocument)), tracker.string.RelatedTo)
    relations!: RelatedDocument[]
}

/**
 * @public
 */
@Model(tracker.class.TimeSpendReport, core.class.AttachedDoc, DOMAIN_TRACKER)
@UX(tracker.string.TimeSpendReport, tracker.icon.TimeReport)
export class TTimeSpendReport extends TAttachedDoc implements TimeSpendReport {
  @Prop(TypeRef(tracker.class.Issue), tracker.string.Parent)
  declare attachedTo: Ref<Issue>

  @Prop(TypeRef(contact.class.Employee), contact.string.Employee)
    employee!: Ref<Employee>

  @Prop(TypeDate(), tracker.string.TimeSpendReportDate)
    date!: Timestamp | null

  @Prop(TypeNumber(), tracker.string.TimeSpendReportValue)
    value!: number

  @Prop(TypeString(), tracker.string.TimeSpendReportDescription)
    description!: string
}

/**
 * @public
 */
@Model(tracker.class.Component, core.class.Doc, DOMAIN_TRACKER)
@UX(tracker.string.Component, tracker.icon.Component, 'COMPONENT')
export class TComponent extends TDoc implements Component {
  @Prop(TypeString(), tracker.string.Title)
  // @Index(IndexKind.FullText)
    label!: string

  @Prop(TypeMarkup(), tracker.string.Description)
    description?: Markup

  @Prop(TypeComponentStatus(), tracker.string.Status)
    status!: ComponentStatus

  @Prop(TypeRef(contact.class.Employee), tracker.string.ComponentLead)
    lead!: Ref<Employee> | null

  @Prop(ArrOf(TypeRef(contact.class.Employee)), tracker.string.Members)
    members!: Ref<Employee>[]

  @Prop(Collection(chunter.class.Comment), chunter.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), attachment.string.Attachments, { shortLabel: attachment.string.Files })
    attachments?: number

  @Prop(TypeDate(DateRangeMode.DATETIME), tracker.string.StartDate)
    startDate!: Timestamp | null

  @Prop(TypeDate(DateRangeMode.DATETIME), tracker.string.TargetDate)
    targetDate!: Timestamp | null

  declare space: Ref<Project>
}

/**
 * @public
 */
@Model(tracker.class.Sprint, core.class.Doc, DOMAIN_TRACKER)
@UX(tracker.string.Sprint, tracker.icon.Sprint)
export class TSprint extends TDoc implements Sprint {
  @Prop(TypeString(), tracker.string.Title)
  // @Index(IndexKind.FullText)
    label!: string

  @Prop(TypeMarkup(), tracker.string.Description)
    description?: Markup

  @Prop(TypeSprintStatus(), tracker.string.Status)
  @Index(IndexKind.Indexed)
    status!: SprintStatus

  @Prop(TypeRef(contact.class.Employee), tracker.string.ComponentLead)
    lead!: Ref<Employee> | null

  @Prop(ArrOf(TypeRef(contact.class.Employee)), tracker.string.Members)
    members!: Ref<Employee>[]

  @Prop(Collection(chunter.class.Comment), chunter.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), attachment.string.Attachments, { shortLabel: attachment.string.Files })
    attachments?: number

  @Prop(TypeDate(), tracker.string.StartDate)
    startDate!: Timestamp

  @Prop(TypeDate(), tracker.string.TargetDate)
    targetDate!: Timestamp

  declare space: Ref<Project>

  @Prop(TypeNumber(), tracker.string.Capacity)
    capacity!: number

  @Prop(TypeRef(tracker.class.Component), tracker.string.Component)
  @Index(IndexKind.Indexed)
    component!: Ref<Component>
}

/**
 * @public
 */
@Model(tracker.class.Scrum, core.class.Doc, DOMAIN_TRACKER)
@UX(tracker.string.Scrum, tracker.icon.Scrum)
export class TScrum extends TDoc implements Scrum {
  @Prop(TypeString(), tracker.string.Title)
    title!: string

  @Prop(TypeMarkup(), tracker.string.Description)
    description?: Markup

  @Prop(Collection(attachment.class.Attachment), attachment.string.Attachments, { shortLabel: attachment.string.Files })
    attachments?: number

  @Prop(ArrOf(TypeRef(contact.class.Employee)), tracker.string.Members)
    members!: Ref<Employee>[]

  @Prop(Collection(tracker.class.Scrum), tracker.string.ScrumRecords)
    scrumRecords?: number

  @Prop(TypeDate(DateRangeMode.TIME), tracker.string.ScrumBeginTime)
    beginTime!: Timestamp

  @Prop(TypeDate(DateRangeMode.TIME), tracker.string.ScrumEndTime)
    endTime!: Timestamp

  declare space: Ref<Project>
}

/**
 * @public
 */
@Model(tracker.class.ScrumRecord, core.class.Doc, DOMAIN_TRACKER)
@UX(tracker.string.ScrumRecord, tracker.icon.Scrum)
export class TScrumRecord extends TAttachedDoc implements ScrumRecord {
  @Prop(TypeString(), tracker.string.Title)
    label!: string

  @Prop(TypeTimestamp(), tracker.string.ScrumBeginTime)
    startTs!: Timestamp

  @Prop(TypeTimestamp(), tracker.string.ScrumEndTime)
    endTs?: Timestamp

  @Prop(Collection(chunter.class.Comment), tracker.string.Comments)
    comments!: number

  @Prop(Collection(attachment.class.Attachment), tracker.string.Attachments)
    attachments!: number

  declare attachedTo: Ref<Scrum>
  declare space: Ref<Project>
  declare scrumRecorder: Ref<EmployeeAccount>
}

@UX(core.string.Number)
@Model(tracker.class.TypeReportedTime, core.class.Type)
export class TTypeReportedTime extends TType {}

export function createModel (builder: Builder): void {
  builder.createModel(
    TProject,
    TComponent,
    TIssue,
    TIssueTemplate,
    TIssueStatus,
    TTypeIssuePriority,
    TTypeComponentStatus,
    TSprint,
    TScrum,
    TScrumRecord,
    TTypeSprintStatus,
    TTimeSpendReport,
    TTypeReportedTime
  )

  const issuesOptions: ViewOptionsModel = {
    groupBy: ['status', 'assignee', 'priority', 'component', 'sprint'],
    orderBy: [
      ['status', SortingOrder.Ascending],
      ['priority', SortingOrder.Ascending],
      ['modifiedOn', SortingOrder.Descending],
      ['dueDate', SortingOrder.Descending],
      ['rank', SortingOrder.Ascending]
    ],
    other: [
      {
        key: 'shouldShowSubIssues',
        type: 'toggle',
        defaultValue: true,
        actionTarget: 'query',
        action: tracker.function.SubIssueQuery,
        label: tracker.string.SubIssues
      },
      {
        key: 'shouldShowAll',
        type: 'toggle',
        defaultValue: false,
        actionTarget: 'category',
        action: view.function.ShowEmptyGroups,
        label: view.string.ShowEmptyGroups
      }
    ]
  }

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: tracker.class.Issue,
      descriptor: view.viewlet.List,
      viewOptions: issuesOptions,
      config: [
        {
          key: '',
          presenter: tracker.component.PriorityEditor,
          props: { type: 'priority', kind: 'list', size: 'small' }
        },
        {
          key: '',
          presenter: tracker.component.IssuePresenter,
          props: { type: 'issue', listProps: { fixed: 'left' } }
        },
        {
          key: '',
          presenter: tracker.component.StatusEditor,
          props: { kind: 'list', size: 'small', justify: 'center' }
        },
        { key: '', presenter: tracker.component.TitlePresenter, props: {} },
        { key: '', presenter: tracker.component.SubIssuesSelector, props: {} },
        { key: '', presenter: view.component.GrowPresenter, props: { type: 'grow' } },
        {
          key: '$lookup.labels',
          presenter: tags.component.LabelsPresenter,
          props: { kind: 'list', full: false, lookupField: 'labels', listProps: { optional: true, compression: true } }
        },
        { key: '', presenter: tracker.component.DueDatePresenter, props: { kind: 'list' } },
        {
          key: '',
          presenter: tracker.component.ComponentEditor,
          props: {
            kind: 'list',
            size: 'small',
            shape: 'round',
            shouldShowPlaceholder: false,
            listProps: {
              excludeByKey: 'component',
              compression: true,
              optional: true
            }
          }
        },
        {
          key: '',
          presenter: tracker.component.SprintEditor,
          props: {
            kind: 'list',
            size: 'small',
            shape: 'round',
            shouldShowPlaceholder: false,
            listProps: {
              excludeByKey: 'sprint',
              compression: true,
              optional: true
            }
          }
        },
        {
          key: '',
          presenter: tracker.component.EstimationEditor,
          props: { kind: 'list', size: 'small', listProps: { optional: true } }
        },
        {
          key: 'modifiedOn',
          presenter: tracker.component.ModificationDatePresenter,
          props: { listProps: { fixed: 'right', optional: true } }
        },
        {
          key: '$lookup.assignee',
          presenter: tracker.component.AssigneePresenter,
          props: { defaultClass: contact.class.Employee, shouldShowLabel: false }
        }
      ]
    },
    tracker.viewlet.IssueList
  )

  const subIssuesOptions: ViewOptionsModel = {
    groupBy: ['status', 'assignee', 'priority', 'sprint'],
    orderBy: [
      ['rank', SortingOrder.Ascending],
      ['status', SortingOrder.Ascending],
      ['priority', SortingOrder.Ascending],
      ['modifiedOn', SortingOrder.Descending],
      ['dueDate', SortingOrder.Descending]
    ],
    groupDepth: 1,
    other: []
  }

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: tracker.class.Issue,
      descriptor: view.viewlet.List,
      viewOptions: subIssuesOptions,
      variant: 'subissue',
      config: [
        {
          key: '',
          presenter: tracker.component.PriorityEditor,
          props: { type: 'priority', kind: 'list', size: 'small' }
        },
        {
          key: '',
          presenter: tracker.component.IssuePresenter,
          props: { type: 'issue', listProps: { fixed: 'left' } }
        },
        {
          key: '',
          presenter: tracker.component.StatusEditor,
          props: { kind: 'list', size: 'small', justify: 'center' }
        },
        { key: '', presenter: tracker.component.TitlePresenter, props: { shouldUseMargin: true, showParent: false } },
        { key: '', presenter: tracker.component.SubIssuesSelector, props: {} },
        { key: '', presenter: view.component.GrowPresenter, props: { type: 'grow' } },
        { key: '', presenter: tracker.component.DueDatePresenter, props: { kind: 'list' } },
        {
          key: '',
          presenter: tracker.component.SprintEditor,
          props: {
            kind: 'list',
            size: 'small',
            shape: 'round',
            shouldShowPlaceholder: false,
            listProps: {
              excludeByKey: 'sprint',
              optional: true
            }
          }
        },
        {
          key: '',
          presenter: tracker.component.EstimationEditor,
          props: { kind: 'list', size: 'small', listProps: { optional: true } }
        },
        {
          key: 'modifiedOn',
          presenter: tracker.component.ModificationDatePresenter,
          props: { listProps: { fixed: 'right', optional: true } }
        },
        {
          key: '$lookup.assignee',
          presenter: tracker.component.AssigneePresenter,
          props: { defaultClass: contact.class.Employee, shouldShowLabel: false }
        }
      ]
    },
    tracker.viewlet.SubIssues
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: tracker.class.IssueTemplate,
      descriptor: view.viewlet.List,
      viewOptions: {
        groupBy: ['assignee', 'priority', 'component', 'sprint'],
        orderBy: [
          ['priority', SortingOrder.Ascending],
          ['modifiedOn', SortingOrder.Descending],
          ['dueDate', SortingOrder.Descending],
          ['rank', SortingOrder.Ascending]
        ],
        other: []
      },
      config: [
        // { key: '', presenter: tracker.component.PriorityEditor, props: { kind: 'list', size: 'small' } },
        {
          key: '',
          presenter: tracker.component.IssueTemplatePresenter,
          props: { type: 'issue', shouldUseMargin: true }
        },
        { key: '', presenter: view.component.GrowPresenter, props: { type: 'grow' } },
        // { key: '', presenter: tracker.component.DueDatePresenter, props: { kind: 'list' } },
        {
          key: '',
          presenter: tracker.component.ComponentEditor,
          props: { kind: 'list', size: 'small', shape: 'round', shouldShowPlaceholder: false }
        },
        {
          key: '',
          presenter: tracker.component.SprintEditor,
          props: { kind: 'list', size: 'small', shape: 'round', shouldShowPlaceholder: false }
        },
        { key: '', presenter: tracker.component.TemplateEstimationEditor, props: { kind: 'list', size: 'small' } },
        {
          key: 'modifiedOn',
          presenter: tracker.component.ModificationDatePresenter,
          props: { listProps: { fixed: 'right' } }
        },
        {
          key: '$lookup.assignee',
          presenter: tracker.component.AssigneePresenter,
          props: { defaultClass: contact.class.Employee, shouldShowLabel: false }
        }
      ]
    },
    tracker.viewlet.IssueTemplateList
  )

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: tracker.class.Issue,
      descriptor: tracker.viewlet.Kanban,
      viewOptions: {
        ...issuesOptions,
        groupDepth: 1
      },
      config: []
    },
    tracker.viewlet.IssueKanban
  )

  builder.createDoc(
    view.class.ViewletDescriptor,
    core.space.Model,
    {
      label: tracker.string.Board,
      icon: task.icon.Kanban,
      component: tracker.component.KanbanView
    },
    tracker.viewlet.Kanban
  )

  builder.createDoc(
    core.class.StatusCategory,
    core.space.Model,
    {
      ofAttribute: tracker.attribute.IssueStatus,
      label: tracker.string.CategoryBacklog,
      icon: tracker.icon.CategoryBacklog,
      color: 12,
      defaultStatusName: 'Backlog',
      order: 0
    },
    tracker.issueStatusCategory.Backlog
  )

  builder.createDoc(
    core.class.StatusCategory,
    core.space.Model,
    {
      ofAttribute: tracker.attribute.IssueStatus,
      label: tracker.string.CategoryUnstarted,
      icon: tracker.icon.CategoryUnstarted,
      color: 13,
      defaultStatusName: 'Todo',
      order: 1
    },
    tracker.issueStatusCategory.Unstarted
  )

  builder.createDoc(
    core.class.StatusCategory,
    core.space.Model,
    {
      ofAttribute: tracker.attribute.IssueStatus,
      label: tracker.string.CategoryStarted,
      icon: tracker.icon.CategoryStarted,
      color: 14,
      defaultStatusName: 'In Progress',
      order: 2
    },
    tracker.issueStatusCategory.Started
  )

  builder.createDoc(
    core.class.StatusCategory,
    core.space.Model,
    {
      ofAttribute: tracker.attribute.IssueStatus,
      label: tracker.string.CategoryCompleted,
      icon: tracker.icon.CategoryCompleted,
      color: 15,
      defaultStatusName: 'Done',
      order: 3
    },
    tracker.issueStatusCategory.Completed
  )

  builder.createDoc(
    core.class.StatusCategory,
    core.space.Model,
    {
      ofAttribute: tracker.attribute.IssueStatus,
      label: tracker.string.CategoryCanceled,
      icon: tracker.icon.CategoryCanceled,
      color: 16,
      defaultStatusName: 'Canceled',
      order: 4
    },
    tracker.issueStatusCategory.Canceled
  )

  const issuesId = 'issues'
  const activeId = 'active'
  const backlogId = 'backlog'
  const boardId = 'board'
  const componentsId = 'components'
  const sprintsId = 'sprints'
  const templatesId = 'templates'
  // const scrumsId = 'scrums'

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.IssuePresenter
  })

  builder.mixin(tracker.class.Issue, core.class.Class, notification.mixin.NotificationObjectPresenter, {
    presenter: tracker.component.NotificationIssuePresenter
  })

  builder.mixin(tracker.class.IssueTemplate, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.IssueTemplatePresenter
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.PreviewPresenter, {
    presenter: tracker.component.IssuePreview
  })

  builder.mixin(tracker.class.TimeSpendReport, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.TimeSpendReport
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.ObjectTitle, {
    titleProvider: tracker.function.IssueTitleProvider
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.ListHeaderExtra, {
    presenters: [tracker.component.IssueStatistics]
  })

  builder.mixin(tracker.class.IssueStatus, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.StatusPresenter
  })

  builder.mixin(tracker.class.IssueStatus, core.class.Class, view.mixin.AttributePresenter, {
    presenter: tracker.component.StatusRefPresenter
  })

  builder.mixin(tracker.class.IssueStatus, core.class.Class, view.mixin.SortFuncs, {
    func: tracker.function.IssueStatusSort
  })

  builder.mixin(tracker.class.TypeIssuePriority, core.class.Class, view.mixin.SortFuncs, {
    func: tracker.function.IssuePrioritySort
  })

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.SortFuncs, {
    func: tracker.function.SprintSort
  })

  builder.mixin(tracker.class.TypeIssuePriority, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.PriorityPresenter
  })

  builder.mixin(tracker.class.Issue, core.class.Class, notification.mixin.ClassCollaborators, {
    fields: ['createdBy', 'assignee']
  })

  builder.mixin(tracker.class.TypeIssuePriority, core.class.Class, view.mixin.AttributeFilter, {
    component: view.component.ValueFilter
  })

  builder.mixin(tracker.class.TypeIssuePriority, core.class.Class, view.mixin.AttributePresenter, {
    presenter: tracker.component.PriorityRefPresenter
  })

  builder.mixin(tracker.class.Component, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.ComponentPresenter
  })

  builder.mixin(tracker.class.Project, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.ProjectPresenter
  })

  classPresenter(
    builder,
    tracker.class.Component,
    tracker.component.ComponentSelector,
    tracker.component.ComponentSelector
  )

  builder.mixin(tracker.class.Component, core.class.Class, view.mixin.AttributeEditor, {
    inlineEditor: tracker.component.ComponentSelector
  })

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.ObjectPresenter, {
    presenter: tracker.component.SprintPresenter
  })

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.AttributePresenter, {
    presenter: tracker.component.SprintRefPresenter
  })

  builder.mixin(tracker.class.Issue, core.class.Class, setting.mixin.Editable, {
    value: true
  })

  builder.mixin(tracker.class.TypeComponentStatus, core.class.Class, view.mixin.AttributeEditor, {
    inlineEditor: tracker.component.ComponentStatusEditor
  })

  builder.mixin(tracker.class.Issue, core.class.Class, notification.mixin.TrackedDoc, {})

  builder.mixin(tracker.class.Issue, core.class.Class, notification.mixin.AnotherUserNotifications, {
    fields: ['assignee']
  })

  builder.mixin(tracker.class.TypeIssuePriority, core.class.Class, view.mixin.AllValuesFunc, {
    func: tracker.function.GetAllPriority
  })

  builder.mixin(tracker.class.Component, core.class.Class, view.mixin.AllValuesFunc, {
    func: tracker.function.GetAllComponents
  })

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.AllValuesFunc, {
    func: tracker.function.GetAllSprints
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.LinkProvider, {
    encode: tracker.function.GetIssueLinkFragment
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.ObjectPanel, {
    component: tracker.component.EditIssue
  })

  builder.mixin(tracker.class.IssueTemplate, core.class.Class, view.mixin.ObjectPanel, {
    component: tracker.component.EditIssueTemplate
  })

  builder.createDoc(
    workbench.class.Application,
    core.space.Model,
    {
      label: tracker.string.TrackerApplication,
      icon: tracker.icon.TrackerApplication,
      alias: trackerId,
      hidden: false,
      locationResolver: tracker.resolver.Location,
      navigatorModel: {
        specials: [
          // {
          //   id: 'inbox',
          //   position: 'top',
          //   label: tracker.string.Inbox,
          //   icon: tracker.icon.Inbox,
          //   component: tracker.component.Inbox
          // },
          {
            id: 'my-issues',
            position: 'top',
            label: tracker.string.MyIssues,
            icon: tracker.icon.MyIssues,
            component: tracker.component.MyIssues
          }
          // {
          //   id: 'views',
          //   position: 'top',
          //   label: tracker.string.Views,
          //   icon: tracker.icon.Views,
          //   component: tracker.component.Views
          // },
        ],
        spaces: [
          {
            label: tracker.string.Projects,
            spaceClass: tracker.class.Project,
            addSpaceLabel: tracker.string.CreateProject,
            createComponent: tracker.component.CreateProject,
            icon: tracker.icon.Home,
            specials: [
              {
                id: issuesId,
                label: tracker.string.Issues,
                icon: tracker.icon.Issues,
                component: tracker.component.Issues
              },
              {
                id: activeId,
                label: tracker.string.Active,
                component: tracker.component.Active
              },
              {
                id: backlogId,
                label: tracker.string.Backlog,
                component: tracker.component.Backlog
              },
              {
                id: componentsId,
                label: tracker.string.Components,
                icon: tracker.icon.Components,
                component: tracker.component.ProjectComponents
              },
              {
                id: sprintsId,
                label: tracker.string.Sprints,
                icon: tracker.icon.Sprint,
                component: tracker.component.Sprints
              },
              // {
              //   id: scrumsId,
              //   label: tracker.string.Scrums,
              //   icon: tracker.icon.Scrum,
              //   component: tracker.component.Scrums
              // },
              {
                id: templatesId,
                label: tracker.string.IssueTemplates,
                icon: tracker.icon.IssueTemplates,
                component: tracker.component.IssueTemplates
              }
            ]
          }
        ]
      },
      navHeaderComponent: tracker.component.NewIssueHeader
    },
    tracker.app.Tracker
  )

  function createGotoSpecialAction (builder: Builder, id: string, key: KeyBinding, label: IntlString): void {
    createNavigateAction(builder, key, label, tracker.app.Tracker, {
      application: trackerId,
      mode: 'space',
      spaceSpecial: id,
      spaceClass: tracker.class.Project
    })
  }

  createGotoSpecialAction(builder, issuesId, 'g->e', tracker.string.GotoIssues)
  createGotoSpecialAction(builder, activeId, 'g->a', tracker.string.GotoActive)
  createGotoSpecialAction(builder, backlogId, 'g->b', tracker.string.GotoBacklog)
  createGotoSpecialAction(builder, boardId, 'g->d', tracker.string.GotoBoard)
  createGotoSpecialAction(builder, componentsId, 'g->c', tracker.string.GotoComponents)

  createAction(builder, {
    action: workbench.actionImpl.Navigate,
    actionProps: {
      mode: 'app',
      application: trackerId
    },
    label: tracker.string.GotoTrackerApplication,
    icon: view.icon.ArrowRight,
    input: 'none',
    category: view.category.Navigation,
    target: core.class.Doc,
    context: {
      mode: ['workbench', 'browser', 'editor', 'panel', 'popup']
    }
  })

  createAction(
    builder,
    {
      action: tracker.actionImpl.EditWorkflowStatuses,
      label: tracker.string.EditWorkflowStatuses,
      icon: view.icon.Statuses,
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Project,
      query: {
        archived: false
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      }
    },
    tracker.action.EditWorkflowStatuses
  )

  createAction(
    builder,
    {
      action: tracker.actionImpl.EditProject,
      label: tracker.string.EditProject,
      icon: contact.icon.Edit,
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Project,
      query: {
        archived: false
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      }
    },
    tracker.action.EditProject
  )

  createAction(
    builder,
    {
      action: tracker.actionImpl.DeleteProject,
      label: tracker.string.DeleteProject,
      icon: view.icon.Delete,
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Project,
      query: {
        archived: false
      },
      context: {
        mode: ['context', 'browser'],
        group: 'edit'
      }
    },
    tracker.action.DeleteProject
  )

  builder.createDoc(
    view.class.ActionCategory,
    core.space.Model,
    { label: tracker.string.TrackerApplication, visible: true },
    tracker.category.Tracker
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.CreateIssue,
        element: 'top'
      },
      label: tracker.string.NewIssue,
      icon: tracker.icon.Issue,
      keyBinding: ['keyC'],
      input: 'none',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['browser'],
        application: tracker.app.Tracker,
        group: 'create'
      }
    },
    tracker.action.NewSubIssue
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'parentIssue',
          space: 'space'
        }
      },
      label: tracker.string.NewSubIssue,
      icon: tracker.icon.Issue,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'associate'
      }
    },
    tracker.action.NewSubIssue
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'relatedTo',
          space: 'space'
        }
      },
      label: tracker.string.NewRelatedIssue,
      icon: tracker.icon.Issue,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: core.class.Doc,
      context: {
        mode: ['context', 'browser', 'editor'],
        group: 'associate'
      }
    },
    tracker.action.NewRelatedIssue
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.SetParentIssueActionPopup,
        element: 'top',
        fillProps: {
          _objects: 'value'
        }
      },
      label: tracker.string.SetParent,
      icon: tracker.icon.Parent,
      keyBinding: [],
      input: 'none',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context'],
        application: tracker.app.Tracker,
        group: 'associate'
      }
    },
    tracker.action.SetParent
  )

  createAction(builder, {
    action: view.actionImpl.ShowPopup,
    actionPopup: tracker.component.SetParentIssueActionPopup,
    actionProps: {
      component: tracker.component.SetParentIssueActionPopup,
      element: 'top',
      fillProps: {
        _object: 'value'
      }
    },
    label: tracker.string.SetParent,
    icon: tracker.icon.Parent,
    keyBinding: [],
    input: 'none',
    category: tracker.category.Tracker,
    target: tracker.class.Issue,
    override: [tracker.action.SetParent],
    context: {
      mode: ['browser'],
      application: tracker.app.Tracker,
      group: 'associate'
    }
  })

  createAction(builder, {
    ...actionTemplates.open,
    actionProps: {
      component: tracker.component.EditIssue
    },
    target: tracker.class.Issue,
    context: {
      mode: ['browser', 'context'],
      group: 'create'
    },
    override: [view.action.Open]
  })

  createAction(builder, {
    ...actionTemplates.open,
    actionProps: {
      component: tracker.component.EditIssueTemplate
    },
    target: tracker.class.IssueTemplate,
    context: {
      mode: ['browser', 'context'],
      group: 'create'
    },
    override: [view.action.Open]
  })

  builder.mixin(tracker.class.Issue, core.class.Class, view.mixin.ClassFilters, {
    filters: []
  })

  builder.mixin(tracker.class.IssueTemplate, core.class.Class, view.mixin.ClassFilters, {
    filters: []
  })

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.ClassFilters, {
    filters: []
  })

  builder.createDoc(
    presentation.class.ObjectSearchCategory,
    core.space.Model,
    {
      icon: tracker.icon.TrackerApplication,
      label: tracker.string.SearchIssue,
      query: tracker.completion.IssueQuery
    },
    tracker.completion.IssueCategory
  )

  const statusOptions: FindOptions<IssueStatus> = {
    lookup: {
      category: core.class.StatusCategory
    },
    sort: { rank: SortingOrder.Ascending }
  }

  createAction(builder, {
    action: view.actionImpl.ShowPopup,
    actionProps: {
      component: tracker.component.TimeSpendReportPopup,
      fillProps: {
        _object: 'issue'
      }
    },
    label: tracker.string.TimeSpendReportAdd,
    icon: tracker.icon.TimeReport,
    input: 'focus',
    keyBinding: ['keyT'],
    category: tracker.category.Tracker,
    target: tracker.class.Issue,
    context: {
      mode: ['context', 'browser'],
      application: tracker.app.Tracker,
      group: 'edit'
    }
  })

  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'status',
        _class: tracker.class.IssueStatus,
        placeholder: tracker.string.SetStatus,
        query: {
          ofAttribute: tracker.attribute.IssueStatus
        },
        fillQuery: {
          space: 'space'
        },
        queryOptions: statusOptions
      },
      label: tracker.string.Status,
      icon: tracker.icon.CategoryBacklog,
      keyBinding: ['keyS->keyS'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetStatus
  )
  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'priority',
        values: defaultPriorities.map((p) => ({ id: p, ...issuePriorities[p] })),
        placeholder: tracker.string.SetPriority
      },
      label: tracker.string.Priority,
      icon: tracker.icon.PriorityHigh,
      keyBinding: ['keyP-keyR'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetPriority
  )
  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'assignee',
        _class: contact.class.Employee,
        query: {},
        placeholder: tracker.string.AssignTo
      },
      label: tracker.string.Assignee,
      icon: contact.icon.Person,
      keyBinding: ['keyA'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetAssignee
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'component',
        _class: tracker.class.Component,
        query: {},
        searchField: 'label',
        placeholder: tracker.string.Component
      },
      label: tracker.string.Component,
      icon: tracker.icon.Component,
      keyBinding: ['keyC'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetComponent
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'sprint',
        _class: tracker.class.Sprint,
        queryOptions: {
          sort: {
            startDate: -1,
            targetDate: -1
          }
        },
        query: {},
        searchField: 'label',
        placeholder: tracker.string.Sprint
      },
      label: tracker.string.Sprint,
      icon: tracker.icon.Sprint,
      keyBinding: ['keyS->keyP'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetSprint
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.SetDueDateActionPopup,
        props: { mondayStart: true, withTime: false },
        element: 'top',
        fillProps: {
          _objects: 'value'
        }
      },
      label: tracker.string.SetDueDate,
      icon: tracker.icon.DueDate,
      keyBinding: ['keyD'],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetDueDate
  )
  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: tracker.function.GetIssueId
      },
      label: tracker.string.CopyIssueId,
      icon: tracker.icon.CopyID,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'copy'
      }
    },
    tracker.action.CopyIssueId
  )
  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: tracker.function.GetIssueTitle
      },
      label: tracker.string.CopyIssueTitle,
      icon: tracker.icon.CopyBranch,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'copy'
      }
    },
    tracker.action.CopyIssueTitle
  )
  createAction(
    builder,
    {
      action: view.actionImpl.CopyTextToClipboard,
      actionProps: {
        textProvider: tracker.function.GetIssueLink
      },
      label: tracker.string.CopyIssueUrl,
      icon: tracker.icon.CopyURL,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'copy'
      }
    },
    tracker.action.CopyIssueLink
  )
  createAction(
    builder,
    {
      action: tracker.actionImpl.Move,
      label: tracker.string.MoveToProject,
      icon: view.icon.Move,
      keyBinding: [],
      input: 'any',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'associate'
      }
    },
    tracker.action.MoveToProject
  )
  // TODO: fix icon
  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: tracker.component.RelationsPopup,
      actionProps: {
        attribute: ''
      },
      label: tracker.string.Relations,
      icon: tracker.icon.Document,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'associate'
      }
    },
    tracker.action.Relations
  )
  createAction(
    builder,
    {
      action: view.actionImpl.ShowPopup,
      actionProps: {
        component: tracker.component.CreateIssue,
        element: 'top',
        fillProps: {
          _object: 'originalIssue',
          space: 'space'
        }
      },
      label: tracker.string.Duplicate,
      icon: tracker.icon.Duplicate,
      keyBinding: [],
      input: 'focus',
      category: tracker.category.Tracker,
      target: tracker.class.Issue,
      context: {
        mode: ['context', 'browser'],
        application: tracker.app.Tracker,
        group: 'associate'
      }
    },
    tracker.action.Duplicate
  )

  createAction(
    builder,
    {
      action: tracker.actionImpl.DeleteSprint,
      label: view.string.Delete,
      icon: view.icon.Delete,
      keyBinding: ['Meta + Backspace', 'Ctrl + Backspace'],
      category: tracker.category.Tracker,
      input: 'any',
      target: tracker.class.Sprint,
      context: { mode: ['context', 'browser'], group: 'tools' }
    },
    tracker.action.DeleteSprint
  )

  builder.mixin(tracker.class.Sprint, core.class.Class, view.mixin.IgnoreActions, {
    actions: [view.action.Delete]
  })

  classPresenter(
    builder,
    tracker.class.TypeReportedTime,
    view.component.NumberPresenter,
    tracker.component.ReportedTimeEditor
  )

  const sprintOptions: ViewOptionsModel = {
    groupBy: ['component', 'lead'],
    orderBy: [
      ['startDate', SortingOrder.Descending],
      ['modifiedOn', SortingOrder.Descending],
      ['targetDate', SortingOrder.Descending],
      ['capacity', SortingOrder.Ascending]
    ],
    other: []
  }

  builder.createDoc(
    view.class.Viewlet,
    core.space.Model,
    {
      attachTo: tracker.class.Sprint,
      descriptor: view.viewlet.List,
      viewOptions: sprintOptions,
      config: [
        {
          key: '',
          presenter: tracker.component.SprintStatusPresenter,
          props: { width: '1rem', kind: 'list', size: 'small', justify: 'center' }
        },
        { key: '', presenter: tracker.component.SprintPresenter, props: { shouldUseMargin: true } },
        { key: '', presenter: view.component.GrowPresenter, props: { type: 'grow' } },
        { key: '', presenter: tracker.component.SprintComponentEditor, props: { kind: 'list' } },
        {
          key: '',
          presenter: contact.component.MembersPresenter,
          props: {
            kind: 'link',
            intlTitle: tracker.string.SprintMembersTitle,
            intlSearchPh: tracker.string.SprintMembersSearchPlaceholder
          }
        },
        { key: '', presenter: tracker.component.SprintDatePresenter, props: { field: 'startDate' } },
        { key: '', presenter: tracker.component.SprintDatePresenter, props: { field: 'targetDate' } },
        {
          key: '$lookup.lead',
          presenter: tracker.component.SprintLeadPresenter,
          props: {
            _class: tracker.class.Sprint,
            defaultClass: contact.class.Employee,
            shouldShowLabel: false,
            size: 'x-small'
          }
        }
      ]
    },
    tracker.viewlet.SprintList
  )

  createAction(
    builder,
    {
      action: view.actionImpl.ValueSelector,
      actionPopup: view.component.ValueSelector,
      actionProps: {
        attribute: 'lead',
        _class: contact.class.Employee,
        query: {},
        placeholder: tracker.string.SprintLead
      },
      label: tracker.string.SprintLead,
      icon: contact.icon.Person,
      keyBinding: [],
      input: 'none',
      category: tracker.category.Tracker,
      target: tracker.class.Sprint,
      context: {
        mode: ['context'],
        application: tracker.app.Tracker,
        group: 'edit'
      }
    },
    tracker.action.SetSprintLead
  )
}

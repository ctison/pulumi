import * as pulumi from '@pulumi/pulumi'
import * as terraform from '@pulumi/terraform'
import { Github } from './Github'

const terraformConfig = new pulumi.Config('terraform')
const terraformState = new terraform.state.RemoteStateReference('terraform', {
  backendType: 'remote',
  organization: terraformConfig.requireSecret('organization'),
  token: terraformConfig.requireSecret('token'),
  workspaces: {
    name: terraformConfig.requireSecret('workspace'),
  },
})

new Github('github', {
  staging: {
    kubeconfig: terraformState.getOutput('production_kubeconfig'),
    k8sIP: terraformState.getOutput('production_k8s_ip'),
    postgresURL: terraformState.getOutput('production_postgres_url'),
  },
})

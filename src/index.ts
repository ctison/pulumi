import * as pulumi from '@pulumi/pulumi'
import * as terraform from '@pulumi/terraform'
import { Environment } from './Environment'
import { Github } from './CI/Github'

const terraformConfig = new pulumi.Config('terraform')
const terraformState = new terraform.state.RemoteStateReference('terraform', {
  backendType: 'remote',
  organization: terraformConfig.requireSecret('organization'),
  token: terraformConfig.requireSecret('token'),
  workspaces: {
    name: terraformConfig.requireSecret('workspace'),
  },
})

new Environment('production', {
  ci: Github,
  kubeconfig: terraformState.getOutput('production_kubeconfig').apply(x => `${x}`),
  k8sIP: terraformState.getOutput('production_k8s_ip').apply(x => `${x}`),
  pgURL: terraformState.getOutput('production_postgres_url').apply(x => `${x}`),
})

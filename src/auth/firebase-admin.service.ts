import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'

@Injectable()
export class FirebaseAdminService {
  private readonly app: App

  constructor(private readonly configService: ConfigService) {
    const projectId = this.configService.getOrThrow<string>(
      'FIREBASE_PROJECT_ID',
    )
    const credentialsJson = this.configService.get<string>(
      'FIREBASE_CREDENTIALS_JSON',
    )

    if (getApps().length > 0) {
      this.app = getApps()[0]
      return
    }

    if (credentialsJson) {
      const parsedCredentials = JSON.parse(credentialsJson) as {
        project_id: string
        client_email: string
        private_key: string
      }

      this.app = initializeApp({
        credential: cert({
          projectId: parsedCredentials.project_id,
          clientEmail: parsedCredentials.client_email,
          privateKey: parsedCredentials.private_key,
        }),
        projectId,
      })
      return
    }

    const clientEmail = this.configService.getOrThrow<string>(
      'FIREBASE_CLIENT_EMAIL',
    )
    const privateKey = this.configService
      .getOrThrow<string>('FIREBASE_PRIVATE_KEY')
      .replace(/\\n/g, '\n')

    this.app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      projectId,
    })
  }

  verifyIdToken(token: string): Promise<DecodedIdToken> {
    return getAuth(this.app).verifyIdToken(token)
  }
}

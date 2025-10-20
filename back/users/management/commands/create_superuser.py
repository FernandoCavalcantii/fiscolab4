from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import IntegrityError

User = get_user_model()

class Command(BaseCommand):
    help = 'Cria um superuser simples e confiável'

    def handle(self, *args, **options):
        admin_email = 'admin@gmail.com'
        admin_password = 'admin12345'
        
        try:
            # Remove usuário existente se houver
            User.objects.filter(email=admin_email).delete()
            
            # Cria novo superuser
            admin_user = User.objects.create_superuser(
                email=admin_email,
                password=admin_password,
                first_name='Admin',
                last_name='User',
                cpf='000.000.000-00'
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'✅ Superuser criado com sucesso!\n'
                    f'   Email: {admin_email}\n'
                    f'   Senha: {admin_password}\n'
                    f'   ID: {admin_user.id}'
                )
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Erro ao criar superuser: {e}')
            )
